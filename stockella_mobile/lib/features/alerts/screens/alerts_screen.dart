import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/services/alert_service.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  final service = AlertService();
  bool loading = true;
  List<dynamic> alertas = [];

  @override
  void initState() {
    super.initState();
    cargarAlertas();
  }

  Future<void> cargarAlertas() async {
    setState(() => loading = true);
    final data = await service.listarAlertas(atendida: false);
    setState(() {
      alertas = data;
      loading = false;
    });
  }

  String formatFecha(dynamic fecha) {
    if (fecha == null) return "-";
    final date = DateTime.tryParse(fecha.toString())?.toLocal();
    if (date == null) return fecha.toString();

    final meses = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Set", "Oct", "Nov", "Dic"
    ];
    final mesStr = (date.month >= 1 && date.month <= 12) ? meses[date.month - 1] : "";

    final period = date.hour >= 12 ? "PM" : "AM";
    var hour12 = date.hour % 12;
    if (hour12 == 0) hour12 = 12;
    final hourStr = hour12.toString().padLeft(2, '0');
    final minStr = date.minute.toString().padLeft(2, '0');

    return "${date.day} de $mesStr, $hourStr:$minStr $period";
  }

  Future<void> atender(int idAlerta) async {
    final ok = await service.marcarAtendida(idAlerta);

    if (!mounted) return;

    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("✅ Alerta atendida")),
      );
      cargarAlertas();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("❌ No se pudo atender la alerta")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: cargarAlertas,
          child: ListView(
            padding: const EdgeInsets.all(18),
            children: [
              const Text(
                "Alertas",
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF1F2937),
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                "Alertas activas de inventario",
                style: TextStyle(color: Color(0xFF6B7280)),
              ),
              const SizedBox(height: 20),

              if (loading)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 80),
                    child: CircularProgressIndicator(),
                  ),
                )
              else if (alertas.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 80),
                  child: Center(child: Text("No hay alertas activas")),
                )
              else
                ...alertas.map((a) {
                  final producto = a["Producto"];
                  final nombre = producto?["nombre"] ?? "Producto";
                  final codigo = producto?["codigo"] ?? "-";
                  final tipo = a["tipo"] ?? "Alerta";
                  final mensaje = a["mensaje"] ?? "";
                  final fecha = formatFecha(a["fecha"]);
                  final idAlerta = a["id_alerta"];

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
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEE2E2),
                                borderRadius: BorderRadius.circular(14),
                              ),
                              child: const Icon(
                                LucideIcons.alertTriangle,
                                color: Color(0xFFEF4444),
                              ),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    tipo,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    fecha,
                                    style: const TextStyle(
                                      color: Color(0xFF6B7280),
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 14),
                        Text(
                          nombre,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 15,
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
                        const SizedBox(height: 8),
                        Text(
                          mensaje,
                          style: const TextStyle(color: Color(0xFF374151)),
                        ),
                        const SizedBox(height: 14),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: () => atender(idAlerta),
                            icon: const Icon(LucideIcons.check),
                            label: const Text("Marcar como atendida"),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF3B82F6),
                              foregroundColor: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                          ),
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