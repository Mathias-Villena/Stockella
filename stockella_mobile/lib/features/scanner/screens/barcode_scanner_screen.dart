import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../../core/services/product_service.dart';
import 'product_detected_screen.dart';

class BarcodeScannerScreen extends StatefulWidget {
  const BarcodeScannerScreen({super.key});

  @override
  State<BarcodeScannerScreen> createState() => _BarcodeScannerScreenState();
}

class _BarcodeScannerScreenState extends State<BarcodeScannerScreen> {
  bool detected = false;

  void onDetect(BarcodeCapture capture) async {
    if (detected) return;

    final barcode = capture.barcodes.firstOrNull;
    final code = barcode?.rawValue;

    if (code == null || code.isEmpty) return;

    setState(() => detected = true);

    final productService = ProductService();
    final producto = await productService.buscarPorCodigo(code);

    if (!mounted) return;

    if (producto == null) {
      showDialog(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text("Producto no encontrado"),
          content: Text("Código: $code"),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                setState(() => detected = false);
              },
              child: const Text("Escanear de nuevo"),
            )
          ],
        ),
      );
      return;
    }

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ProductDetectedScreen(producto: producto),
      ),
    );

    if (!mounted) return;

    if (result == "scan_again") {
      setState(() => detected = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      body: Stack(
        children: [
          MobileScanner(
            onDetect: onDetect,
          ),

          Positioned(
            top: 45,
            left: 18,
            child: CircleAvatar(
              backgroundColor: Colors.black.withOpacity(0.45),
              child: IconButton(
                icon: const Icon(LucideIcons.x, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ),
          ),

          Positioned(
            top: 45,
            left: 85,
            right: 85,
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.45),
                borderRadius: BorderRadius.circular(22),
              ),
              child: const Center(
                child: Text(
                  "Código de Barras",
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
          ),

          Center(
            child: Container(
              width: 250,
              height: 220,
              decoration: BoxDecoration(
                border: Border.all(
                  color: const Color(0xFF06B6D4),
                  width: 3,
                ),
                borderRadius: BorderRadius.circular(18),
              ),
            ),
          ),

          const Positioned(
            left: 0,
            right: 0,
            bottom: 80,
            child: Center(
              child: Text(
                "Apunta al código de barras del producto",
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }
}