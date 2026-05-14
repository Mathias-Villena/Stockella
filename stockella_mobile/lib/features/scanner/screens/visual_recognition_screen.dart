import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/services/ml_service.dart';
import '../../../core/services/product_service.dart';
import 'movement_form_screen.dart';

class VisualRecognitionScreen extends StatefulWidget {
  const VisualRecognitionScreen({super.key});

  @override
  State<VisualRecognitionScreen> createState() => _VisualRecognitionScreenState();
}

class _VisualRecognitionScreenState extends State<VisualRecognitionScreen> {
  final picker = ImagePicker();
  bool loading = false;
  File? image;
  Map<String, dynamic>? result;
  Map<String, dynamic>? productoBD;

  String etiquetaToNombre(String etiqueta) {
    return etiqueta.replaceAll("_", " ");
  }

  Future<void> tomarFoto() async {
    final picked = await picker.pickImage(
      source: ImageSource.camera,
      imageQuality: 85,
      maxWidth: 900,
    );

    if (picked == null) return;

    setState(() {
      image = File(picked.path);
      result = null;
      productoBD = null;
      loading = true;
    });

    final res = await MlService().predecirProducto(picked.path);

    if (!mounted) return;

    if (res != null && res["producto"] != null) {
      final nombreBuscado = etiquetaToNombre(res["producto"]);
      final producto = await ProductService().buscarPorNombre(nombreBuscado);

      setState(() {
        result = res;
        productoBD = producto;
        loading = false;
      });
    } else {
      setState(() {
        result = res;
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final etiqueta = result?["producto"];
    final confidence = result?["confidence"];
    final porcentaje = confidence == null
        ? "-"
        : "${(double.parse(confidence.toString()) * 100).toStringAsFixed(1)}%";

    final nombreProducto = productoBD?["nombre"] ?? etiquetaToNombre(etiqueta ?? "-");
    final stock = productoBD?["stock_actual"];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("Reconocimiento Visual"),
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Container(
            height: 300,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: image == null
                ? const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          LucideIcons.camera,
                          size: 52,
                          color: Color(0xFF06B6D4),
                        ),
                        SizedBox(height: 12),
                        Text("Toma una foto del producto"),
                      ],
                    ),
                  )
                : ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: Image.file(image!, fit: BoxFit.cover),
                  ),
          ),

          const SizedBox(height: 20),

          ElevatedButton.icon(
            onPressed: loading ? null : tomarFoto,
            icon: const Icon(LucideIcons.camera),
            label: Text(loading ? "Analizando..." : "Tomar foto y reconocer"),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF06B6D4),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
          ),

          const SizedBox(height: 22),

          if (loading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: CircularProgressIndicator(),
              ),
            ),

          if (result != null)
            Container(
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.07),
                    blurRadius: 16,
                    offset: const Offset(0, 7),
                  ),
                ],
              ),
              child: Column(
                children: [
                  const CircleAvatar(
                    radius: 36,
                    backgroundColor: Color(0xFFDBEAFE),
                    child: Icon(
                      LucideIcons.checkCircle,
                      size: 40,
                      color: Color(0xFF3B82F6),
                    ),
                  ),

                  const SizedBox(height: 16),

                  const Text(
                    "¡Producto Detectado!",
                    style: TextStyle(
                      fontSize: 23,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1F2937),
                    ),
                  ),

                  const SizedBox(height: 6),

                  Text(
                    "Confianza: $porcentaje",
                    style: const TextStyle(color: Color(0xFF6B7280)),
                  ),

                  const SizedBox(height: 20),

                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          "Producto",
                          style: TextStyle(
                            color: Color(0xFF6B7280),
                            fontSize: 13,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          nombreProducto,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (stock != null) ...[
                          const SizedBox(height: 10),
                          Text(
                            "Stock actual: $stock",
                            style: const TextStyle(color: Color(0xFF6B7280)),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: tomarFoto,
                          style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 52),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: const Text("Otra foto"),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: productoBD == null
                              ? null
                              : () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (_) => MovementFormScreen(
                                        producto: productoBD!,
                                      ),
                                    ),
                                  );
                                },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3B82F6),
                            foregroundColor: Colors.white,
                            minimumSize: const Size(0, 52),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: const Text("Registrar"),
                        ),
                      ),
                    ],
                  ),

                  if (productoBD == null) ...[
                    const SizedBox(height: 14),
                    const Text(
                      "Producto detectado por IA, pero no encontrado en la BD.",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Color(0xFFEF4444),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }
}