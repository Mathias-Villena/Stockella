import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/services/movement_service.dart';

class MovementFormScreen extends StatefulWidget {
  final Map<String, dynamic> producto;

  const MovementFormScreen({super.key, required this.producto});

  @override
  State<MovementFormScreen> createState() => _MovementFormScreenState();
}

class _MovementFormScreenState extends State<MovementFormScreen> {
  int cantidad = 1;
  String tipo = "Entrada";
  final notasController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final nombre = widget.producto["nombre"] ?? "Producto";
    final codigo = widget.producto["codigo"] ?? "-";
    final stockActual = widget.producto["stock_actual"] ?? 0;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            Text(
              "$tipo de Producto",
              style: const TextStyle(
                fontSize: 27,
                fontWeight: FontWeight.w800,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              tipo == "Entrada"
                  ? "Registra la cantidad recibida"
                  : "Registra la cantidad retirada",
              style: const TextStyle(color: Color(0xFF6B7280)),
            ),
            const SizedBox(height: 24),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: _cardDecoration(),
              child: Row(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      color: const Color(0xFFDBEAFE),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(
                      LucideIcons.package,
                      color: Color(0xFF3B82F6),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(nombre,
                            style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w800)),
                        const SizedBox(height: 4),
                        Text("Código: $codigo",
                            style: const TextStyle(
                                color: Color(0xFF6B7280))),
                        const SizedBox(height: 4),
                        Text("Stock actual: $stockActual",
                            style: const TextStyle(
                                color: Color(0xFF6B7280))),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: _cardDecoration(),
              child: Row(
                children: [
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text("Entrada")),
                      selected: tipo == "Entrada",
                      selectedColor: const Color(0xFFDBEAFE),
                      onSelected: (_) => setState(() => tipo = "Entrada"),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ChoiceChip(
                      label: const Center(child: Text("Salida")),
                      selected: tipo == "Salida",
                      selectedColor: const Color(0xFFFEE2E2),
                      onSelected: (_) => setState(() => tipo = "Salida"),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: _cardDecoration(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    tipo == "Entrada"
                        ? "Cantidad Recibida"
                        : "Cantidad Retirada",
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _RoundButton(
                        icon: LucideIcons.minus,
                        onTap: () {
                          if (cantidad > 1) setState(() => cantidad--);
                        },
                      ),
                      Column(
                        children: [
                          Text(
                            "$cantidad",
                            style: const TextStyle(
                              fontSize: 38,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const Text(
                            "unidades",
                            style: TextStyle(color: Color(0xFF6B7280)),
                          ),
                        ],
                      ),
                      _RoundButton(
                        icon: LucideIcons.plus,
                        active: true,
                        onTap: () => setState(() => cantidad++),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [5, 10, 25, 50].map((n) {
                      return Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: OutlinedButton(
                            onPressed: () => setState(() => cantidad += n),
                            child: Text("+$n"),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              "Notas (Opcional)",
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: notasController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: tipo == "Entrada"
                    ? "Ej: Recibido en buen estado..."
                    : "Ej: Retiro por venta o despacho...",
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: () async {
                final service = MovementService();

                final ok = await service.registrarMovimiento(
                  idProducto: widget.producto["id_producto"],
                  tipo: tipo,
                  cantidad: cantidad,
                  motivo: notasController.text,
                );

                if (!mounted) return;

                if (ok) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("✅ Movimiento registrado"),
                    ),
                  );

                  Navigator.popUntil(context, (route) => route.isFirst);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text("❌ Error al guardar movimiento"),
                    ),
                  );
                }
              },
              icon: Icon(
                tipo == "Entrada" ? LucideIcons.upload : LucideIcons.download,
              ),
              label: Text(
                tipo == "Entrada"
                    ? "Subir al Inventario"
                    : "Registrar Salida",
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: tipo == "Entrada"
                    ? const Color(0xFF3B82F6)
                    : const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),

            const SizedBox(height: 18),

            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFBFDBFE)),
              ),
              child: const Text(
                "⚡ Los cambios se sincronizarán automáticamente con la plataforma web.",
                style: TextStyle(color: Color(0xFF1E40AF), fontSize: 13),
              ),
            ),
          ],
        ),
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.06),
          blurRadius: 12,
          offset: const Offset(0, 5),
        ),
      ],
    );
  }
}

class _RoundButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  final bool active;

  const _RoundButton({
    required this.icon,
    required this.onTap,
    this.active = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(100),
      child: CircleAvatar(
        radius: 28,
        backgroundColor:
            active ? const Color(0xFF3B82F6) : const Color(0xFFF3F4F6),
        child: Icon(
          icon,
          color: active ? Colors.white : const Color(0xFF374151),
        ),
      ),
    );
  }
}