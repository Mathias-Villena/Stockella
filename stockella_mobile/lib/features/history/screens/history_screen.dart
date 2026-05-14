import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/services/history_service.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final HistoryService service = HistoryService();

  bool loading = true;
  List<dynamic> movimientos = [];
  String filtro = "Todos";

  @override
  void initState() {
    super.initState();
    cargarMovimientos();
  }

  Future<void> cargarMovimientos() async {
    setState(() => loading = true);
    final data = await service.listarMovimientos();
    setState(() {
      movimientos = data;
      loading = false;
    });
  }

  List<dynamic> get movimientosFiltrados {
    if (filtro == "Todos") return movimientos;
    return movimientos.where((m) => m["tipo"] == filtro).toList();
  }

  int totalPorTipo(String tipo) {
    return movimientos
        .where((m) => m["tipo"] == tipo)
        .fold(0, (sum, m) => sum + (int.tryParse(m["cantidad"].toString()) ?? 0));
  }

  String formatFecha(dynamic fecha) {
    if (fecha == null) return "-";
    final date = DateTime.tryParse(fecha.toString());
    if (date == null) return fecha.toString();

    return "${date.day}/${date.month}/${date.year} ${date.hour}:${date.minute.toString().padLeft(2, '0')}";
  }

  @override
  Widget build(BuildContext context) {
    final lista = movimientosFiltrados;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: cargarMovimientos,
          child: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              const Text(
                "Historial",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                "Movimientos de inventario",
                style: TextStyle(color: Color(0xFF6B7280)),
              ),
              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: _SummaryCard(
                      title: "Entradas",
                      value: "+${totalPorTipo("Entrada")}",
                      color: const Color(0xFF2563EB),
                      icon: LucideIcons.trendingUp,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _SummaryCard(
                      title: "Salidas",
                      value: "-${totalPorTipo("Salida")}",
                      color: const Color(0xFFEF4444),
                      icon: LucideIcons.trendingDown,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 18),

              Row(
                children: [
                  _FilterChip(
                    label: "Todos",
                    selected: filtro == "Todos",
                    onTap: () => setState(() => filtro = "Todos"),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: "Entrada",
                    selected: filtro == "Entrada",
                    onTap: () => setState(() => filtro = "Entrada"),
                  ),
                  const SizedBox(width: 8),
                  _FilterChip(
                    label: "Salida",
                    selected: filtro == "Salida",
                    onTap: () => setState(() => filtro = "Salida"),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              if (loading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 80),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (lista.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 80),
                  child: Center(child: Text("No hay movimientos registrados")),
                )
              else
                ...lista.map((m) {
                  final producto = m["Producto"];
                  final usuario = m["Usuario"];

                  final nombreProducto = producto?["nombre"] ?? "Producto";
                  final codigo = producto?["codigo"] ?? "-";
                  final usuarioNombre = usuario?["nombre"] ?? "Usuario";
                  final tipo = m["tipo"] ?? "-";
                  final cantidad = m["cantidad"] ?? 0;
                  final motivo = m["motivo"] ?? "Sin motivo";
                  final fecha = formatFecha(m["fecha"]);

                  final isEntrada = tipo == "Entrada";

                  return Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.06),
                          blurRadius: 12,
                          offset: const Offset(0, 5),
                        )
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: isEntrada
                                ? const Color(0xFFDBEAFE)
                                : const Color(0xFFFEE2E2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            isEntrada
                                ? LucideIcons.arrowDownToLine
                                : LucideIcons.arrowUpFromLine,
                            color: isEntrada
                                ? const Color(0xFF2563EB)
                                : const Color(0xFFEF4444),
                          ),
                        ),
                        const SizedBox(width: 14),

                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                nombreProducto,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                "Código: $codigo",
                                style: const TextStyle(
                                  color: Color(0xFF6B7280),
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                "$fecha · $usuarioNombre",
                                style: const TextStyle(
                                  color: Color(0xFF6B7280),
                                  fontSize: 12,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                motivo,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  color: Color(0xFF374151),
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),

                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 5,
                              ),
                              decoration: BoxDecoration(
                                color: isEntrada
                                    ? const Color(0xFFDBEAFE)
                                    : const Color(0xFFFEE2E2),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                tipo,
                                style: TextStyle(
                                  color: isEntrada
                                      ? const Color(0xFF2563EB)
                                      : const Color(0xFFEF4444),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              "${isEntrada ? '+' : '-'}$cantidad",
                              style: TextStyle(
                                color: isEntrada
                                    ? const Color(0xFF2563EB)
                                    : const Color(0xFFEF4444),
                                fontWeight: FontWeight.w900,
                                fontSize: 20,
                              ),
                            ),
                            const Text(
                              "unid.",
                              style: TextStyle(
                                fontSize: 11,
                                color: Color(0xFF6B7280),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final IconData icon;

  const _SummaryCard({
    required this.title,
    required this.value,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.25),
            blurRadius: 14,
            offset: const Offset(0, 7),
          )
        ],
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      selectedColor: const Color(0xFFDBEAFE),
      onSelected: (_) => onTap(),
      labelStyle: TextStyle(
        color: selected ? const Color(0xFF2563EB) : const Color(0xFF374151),
        fontWeight: FontWeight.w700,
      ),
    );
  }
}