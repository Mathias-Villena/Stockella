import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:fl_chart/fl_chart.dart';

import '../../../core/storage/token_storage.dart';
import '../../../core/services/dashboard_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  Map<String, String?> user = {};
  bool loading = true;

  Map<String, dynamic> dashboard = {};
  Map<String, dynamic> cards = {};

  @override
  void initState() {
    super.initState();
    iniciar();
  }

  Future<void> iniciar() async {
    await loadUser();
    await loadDashboard();
  }

  Future<void> loadUser() async {
    final data = await TokenStorage.getUser();
    setState(() => user = data);
  }

  Future<void> loadDashboard() async {
    final service = DashboardService();
    final data = await service.obtenerResumen();

    setState(() {
      dashboard = data ?? {};
      cards = dashboard["cards"] ?? {};
      loading = false;
    });
  }

  String val(String key) => (cards[key] ?? 0).toString();

  String saludo() {
    final h = DateTime.now().hour;
    if (h < 12) return "Buenos días";
    if (h < 18) return "Buenas tardes";
    return "Buenas noches";
  }

  List<dynamic> get stockPorCategoria {
    final data = dashboard["stockPorCategoria"];
    if (data is List) return data;
    return [];
  }

  List<dynamic> get diasSemana {
    final data = dashboard["movimientosSemana"]?["dias"];
    if (data is List) return data;
    return [];
  }

  List<dynamic> get entradasSemana {
    final data = dashboard["movimientosSemana"]?["entradas"];
    if (data is List) return data;
    return [];
  }

  List<dynamic> get salidasSemana {
    final data = dashboard["movimientosSemana"]?["salidas"];
    if (data is List) return data;
    return [];
  }

  @override
  Widget build(BuildContext context) {
    final stockOk = val("stockOk");
    final stockBajo = val("stockBajoProductos");
    final agotados = val("productosAgotados");

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: loadDashboard,
          child: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF3B82F6), Color(0xFF06B6D4)],
                  ),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Row(
                  children: [
                    const CircleAvatar(
                      radius: 28,
                      backgroundColor: Colors.white24,
                      child: Icon(LucideIcons.user, color: Colors.white),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            saludo(),
                            style: const TextStyle(
                              color: Colors.white70,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            user["nombre"] ?? "Empleado",
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            "Inventario sincronizado",
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              if (loading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(50),
                    child: CircularProgressIndicator(),
                  ),
                )
              else ...[
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 14,
                  mainAxisSpacing: 14,
                  childAspectRatio: 1.32,
                  children: [
                    _CardInfo(
                      icon: LucideIcons.package,
                      title: "Productos",
                      value: val("productos"),
                      color: const Color(0xFF3B82F6),
                    ),
                    _CardInfo(
                      icon: LucideIcons.alertTriangle,
                      title: "Stock Bajo",
                      value: stockBajo,
                      color: const Color(0xFFF59E0B),
                    ),
                    _CardInfo(
                      icon: LucideIcons.xCircle,
                      title: "Agotados",
                      value: agotados,
                      color: const Color(0xFFEF4444),
                    ),
                    _CardInfo(
                      icon: LucideIcons.activity,
                      title: "Mov. Hoy",
                      value: val("movimientosHoy"),
                      color: const Color(0xFF10B981),
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                const Text(
                  "Estado del inventario",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),

                const SizedBox(height: 14),

                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: _box(),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _MiniStat(
                              title: "Stock OK",
                              value: stockOk,
                              color: const Color(0xFF10B981),
                            ),
                          ),
                          Expanded(
                            child: _MiniStat(
                              title: "Críticos",
                              value: stockBajo,
                              color: const Color(0xFFF59E0B),
                            ),
                          ),
                          Expanded(
                            child: _MiniStat(
                              title: "Agotados",
                              value: agotados,
                              color: const Color(0xFFEF4444),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      LinearProgressIndicator(
                        value: (int.tryParse(val("productos")) ?? 0) == 0
                            ? 0
                            : (int.tryParse(stockOk) ?? 0) /
                                (int.tryParse(val("productos")) ?? 1),
                        minHeight: 8,
                        borderRadius: BorderRadius.circular(20),
                        backgroundColor: const Color(0xFFE5E7EB),
                        color: const Color(0xFF10B981),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                const Text(
                  "Movimientos semanales",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),

                const SizedBox(height: 14),

                Container(
                  height: 260,
                  padding: const EdgeInsets.all(18),
                  decoration: _box(),
                  child: entradasSemana.isEmpty && salidasSemana.isEmpty
                      ? const Center(child: Text("Sin datos semanales"))
                      : LineChart(
                          LineChartData(
                            minY: 0,
                            gridData: FlGridData(show: false),
                            borderData: FlBorderData(show: false),
                            titlesData: FlTitlesData(
                              rightTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                              topTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 28,
                                  getTitlesWidget: (value, meta) {
                                    return Text(
                                      value.toInt().toString(),
                                      style: const TextStyle(fontSize: 10),
                                    );
                                  },
                                ),
                              ),
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 30,
                                  getTitlesWidget: (value, meta) {
                                    final index = value.toInt();

                                    if (index < 0 || index >= diasSemana.length) {
                                      return const Text("");
                                    }

                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Text(
                                        diasSemana[index].toString(),
                                        style: const TextStyle(fontSize: 10),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                            lineBarsData: [
                              LineChartBarData(
                                spots: List.generate(
                                  entradasSemana.length,
                                  (i) => FlSpot(
                                    i.toDouble(),
                                    (entradasSemana[i] as num).toDouble(),
                                  ),
                                ),
                                isCurved: true,
                                barWidth: 4,
                                color: const Color(0xFF3B82F6),
                                dotData: FlDotData(show: false),
                                belowBarData: BarAreaData(
                                  show: true,
                                  color: const Color(0xFF3B82F6).withOpacity(0.12),
                                ),
                              ),
                              LineChartBarData(
                                spots: List.generate(
                                  salidasSemana.length,
                                  (i) => FlSpot(
                                    i.toDouble(),
                                    (salidasSemana[i] as num).toDouble(),
                                  ),
                                ),
                                isCurved: true,
                                barWidth: 4,
                                color: const Color(0xFFEF4444),
                                dotData: FlDotData(show: false),
                                belowBarData: BarAreaData(
                                  show: true,
                                  color: const Color(0xFFEF4444).withOpacity(0.10),
                                ),
                              ),
                            ],
                          ),
                        ),
                ),

                const SizedBox(height: 10),

                const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _LegendDot(color: Color(0xFF3B82F6), label: "Entradas"),
                    SizedBox(width: 18),
                    _LegendDot(color: Color(0xFFEF4444), label: "Salidas"),
                  ],
                ),

                const SizedBox(height: 28),

                const Text(
                  "Stock por categoría",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),

                const SizedBox(height: 14),

                Container(
                  height: 270,
                  padding: const EdgeInsets.all(18),
                  decoration: _box(),
                  child: stockPorCategoria.isEmpty
                      ? const Center(child: Text("Sin datos por categoría"))
                      : BarChart(
                          BarChartData(
                            gridData: FlGridData(show: false),
                            borderData: FlBorderData(show: false),
                            titlesData: FlTitlesData(
                              rightTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                              topTitles: const AxisTitles(
                                sideTitles: SideTitles(showTitles: false),
                              ),
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 30,
                                  getTitlesWidget: (value, meta) {
                                    return Text(
                                      value.toInt().toString(),
                                      style: const TextStyle(fontSize: 10),
                                    );
                                  },
                                ),
                              ),
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 48,
                                  getTitlesWidget: (value, meta) {
                                    final index = value.toInt();

                                    if (index < 0 ||
                                        index >= stockPorCategoria.length) {
                                      return const Text("");
                                    }

                                    final categoria =
                                        stockPorCategoria[index]["categoria"] ??
                                            "-";

                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8),
                                      child: Transform.rotate(
                                        angle: -0.45,
                                        child: Text(
                                          categoria.toString(),
                                          style: const TextStyle(fontSize: 10),
                                        ),
                                      ),
                                    );
                                  },
                                ),
                              ),
                            ),
                            barGroups: List.generate(
                              stockPorCategoria.length,
                              (i) {
                                final item = stockPorCategoria[i];

                                return BarChartGroupData(
                                  x: i,
                                  barRods: [
                                    BarChartRodData(
                                      toY: (item["total"] as num).toDouble(),
                                      width: 24,
                                      borderRadius: BorderRadius.circular(8),
                                      color: const Color(0xFF06B6D4),
                                    ),
                                  ],
                                );
                              },
                            ),
                          ),
                        ),
                ),

                const SizedBox(height: 28),

                const Text(
                  "Actividad reciente",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                ),

                const SizedBox(height: 14),

                _ActivityItem(
                  icon: LucideIcons.refreshCcw,
                  title: "Dashboard actualizado",
                  subtitle: "Desliza hacia abajo para refrescar datos",
                  color: const Color(0xFF3B82F6),
                ),
                const SizedBox(height: 12),
                _ActivityItem(
                  icon: LucideIcons.shieldCheck,
                  title: "Backend conectado",
                  subtitle: "Inventario, movimientos y alertas activos",
                  color: const Color(0xFF10B981),
                ),
                const SizedBox(height: 12),
                _ActivityItem(
                  icon: LucideIcons.sparkles,
                  title: "Reconocimiento ML activo",
                  subtitle: "Código de barras y cámara inteligente disponibles",
                  color: const Color(0xFF8B5CF6),
                ),
              ],

              const SizedBox(height: 30),
            ],
          ),
        ),
      ),
    );
  }

  BoxDecoration _box() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.05),
          blurRadius: 14,
          offset: const Offset(0, 6),
        ),
      ],
    );
  }
}

class _CardInfo extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _CardInfo({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 14,
            offset: const Offset(0, 6),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            backgroundColor: color.withOpacity(0.12),
            child: Icon(icon, color: color),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
          ),
          Text(
            title,
            style: const TextStyle(color: Color(0xFF6B7280), fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final String title;
  final String value;
  final Color color;

  const _MiniStat({
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 24,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: const TextStyle(color: Color(0xFF6B7280), fontSize: 11),
        ),
      ],
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  const _ActivityItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 12)
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: color.withOpacity(0.12),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
                Text(
                  subtitle,
                  style: const TextStyle(
                    color: Color(0xFF6B7280),
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }
}

class _LegendDot extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendDot({
    required this.color,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(radius: 5, backgroundColor: color),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}