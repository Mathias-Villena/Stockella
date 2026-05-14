import 'dart:async';
import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:vibration/vibration.dart';

import '../../../core/services/ml_service.dart';
import '../../../core/services/product_service.dart';
import 'movement_form_screen.dart';

class LiveVisualScannerScreen extends StatefulWidget {
  const LiveVisualScannerScreen({super.key});

  @override
  State<LiveVisualScannerScreen> createState() =>
      _LiveVisualScannerScreenState();
}

class _LiveVisualScannerScreenState
    extends State<LiveVisualScannerScreen> {
  CameraController? controller;
  Timer? timer;

  final AudioPlayer player = AudioPlayer();

  bool loadingCamera = true;
  bool analyzing = false;
  bool paused = false;

  Map<String, dynamic>? productoBD;
  Map<String, dynamic>? result;

  final double minConfidence = 0.75;

  @override
  void initState() {
    super.initState();
    initCamera();
  }

  Future<void> initCamera() async {
    final cameras = await availableCameras();

    final backCamera = cameras.firstWhere(
      (cam) => cam.lensDirection == CameraLensDirection.back,
      orElse: () => cameras.first,
    );

    controller = CameraController(
      backCamera,
      ResolutionPreset.medium,
      enableAudio: false,
    );

    await controller!.initialize();

    if (!mounted) return;

    setState(() => loadingCamera = false);

    timer = Timer.periodic(
      const Duration(seconds: 2),
      (_) => analizarFrame(),
    );
  }

  String etiquetaToNombre(String etiqueta) {
    return etiqueta.replaceAll("_", " ");
  }

  Future<void> analizarFrame() async {
    if (controller == null) return;
    if (!controller!.value.isInitialized) return;
    if (analyzing || paused) return;

    analyzing = true;

    try {
      final picture = await controller!.takePicture();

      final res = await MlService().predecirProducto(picture.path);

      if (!mounted) return;

      if (res != null && res["producto"] != null) {
        final confidence =
            double.tryParse(res["confidence"].toString()) ?? 0;

        if (confidence >= minConfidence) {
          final nombreBuscado =
              etiquetaToNombre(res["producto"]);

          final producto =
              await ProductService().buscarPorNombre(nombreBuscado);

          if (!mounted) return;

          final hasVibrator =
              await Vibration.hasVibrator();

          if (hasVibrator == true) {
            Vibration.vibrate(duration: 180);
          }

          await player.play(
            AssetSource('sounds/success.mp3'),
          );

          setState(() {
            result = res;
            productoBD = producto;
            paused = true;
          });
        }
      }

      File(picture.path).delete().catchError((_) {});
    } catch (e) {
      print("❌ Error analizando frame: $e");
    } finally {
      analyzing = false;
    }
  }

  void reanudar() {
    setState(() {
      result = null;
      productoBD = null;
      paused = false;
    });
  }

  @override
  void dispose() {
    timer?.cancel();
    controller?.dispose();
    player.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final etiqueta = result?["producto"];

    final confidence = result?["confidence"];

    final porcentaje = confidence == null
        ? "-"
        : "${((double.tryParse(confidence.toString()) ?? 0) * 100).toStringAsFixed(1)}%";

    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      body: loadingCamera
          ? const Center(
              child: CircularProgressIndicator(),
            )
          : Stack(
              children: [
                Positioned.fill(
                  child: CameraPreview(controller!),
                ),

                Container(
                  color: Colors.black.withOpacity(0.18),
                ),

                Positioned(
                  top: 45,
                  left: 18,
                  child: CircleAvatar(
                    backgroundColor:
                        Colors.black.withOpacity(0.45),
                    child: IconButton(
                      icon: const Icon(
                        LucideIcons.x,
                        color: Colors.white,
                      ),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                ),

                Positioned(
                  top: 45,
                  left: 85,
                  right: 85,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color:
                          Colors.black.withOpacity(0.45),
                      borderRadius:
                          BorderRadius.circular(22),
                    ),
                    child: const Center(
                      child: Text(
                        "Reconocimiento Visual",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),

                Center(
                  child: AnimatedContainer(
                    duration:
                        const Duration(milliseconds: 300),
                    width: 260,
                    height: 260,
                    decoration: BoxDecoration(
                      border: Border.all(
                        color: paused
                            ? const Color(0xFF22C55E)
                            : analyzing
                                ? const Color(0xFFF59E0B)
                                : const Color(0xFF06B6D4),
                        width: 3,
                      ),
                      borderRadius:
                          BorderRadius.circular(22),
                    ),
                  ),
                ),

                Positioned(
                  left: 20,
                  right: 20,
                  bottom: 35,
                  child: productoBD == null
                      ? Container(
                          padding:
                              const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.black
                                .withOpacity(0.55),
                            borderRadius:
                                BorderRadius.circular(18),
                          ),
                          child: Text(
                            analyzing
                                ? "Analizando producto..."
                                : "Apunta la cámara al producto",
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                            ),
                          ),
                        )
                      : AnimatedContainer(
                          duration: const Duration(
                              milliseconds: 300),
                          padding:
                              const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius:
                                BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black
                                    .withOpacity(0.25),
                                blurRadius: 20,
                              )
                            ],
                          ),
                          child: Column(
                            mainAxisSize:
                                MainAxisSize.min,
                            children: [
                              const CircleAvatar(
                                radius: 32,
                                backgroundColor:
                                    Color(0xFFDBEAFE),
                                child: Icon(
                                  LucideIcons.checkCircle,
                                  color:
                                      Color(0xFF3B82F6),
                                  size: 36,
                                ),
                              ),

                              const SizedBox(height: 12),

                              const Text(
                                "¡Producto Detectado!",
                                style: TextStyle(
                                  fontSize: 21,
                                  fontWeight:
                                      FontWeight.w800,
                                ),
                              ),

                              const SizedBox(height: 6),

                              Text(
                                "Confianza: $porcentaje",
                                style: const TextStyle(
                                  color:
                                      Color(0xFF6B7280),
                                ),
                              ),

                              const SizedBox(height: 14),

                              Container(
                                width: double.infinity,
                                padding:
                                    const EdgeInsets.all(
                                        14),
                                decoration: BoxDecoration(
                                  color: const Color(
                                      0xFFF8FAFC),
                                  borderRadius:
                                      BorderRadius
                                          .circular(16),
                                ),
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment
                                          .start,
                                  children: [
                                    const Text(
                                      "Producto",
                                      style: TextStyle(
                                        color: Color(
                                            0xFF6B7280),
                                        fontSize: 13,
                                      ),
                                    ),

                                    Text(
                                      productoBD?[
                                              "nombre"] ??
                                          etiqueta ??
                                          "-",
                                      style:
                                          const TextStyle(
                                        fontSize: 18,
                                        fontWeight:
                                            FontWeight
                                                .w800,
                                      ),
                                    ),

                                    Text(
                                      "Stock actual: ${productoBD?["stock_actual"] ?? "-"}",
                                      style:
                                          const TextStyle(
                                        color: Color(
                                            0xFF6B7280),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 16),

                              Row(
                                children: [
                                  Expanded(
                                    child:
                                        OutlinedButton(
                                      onPressed:
                                          reanudar,
                                      child: const Text(
                                        "Escanear otro",
                                      ),
                                    ),
                                  ),

                                  const SizedBox(
                                      width: 10),

                                  Expanded(
                                    child:
                                        ElevatedButton(
                                      onPressed: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) =>
                                                MovementFormScreen(
                                              producto:
                                                  productoBD!,
                                            ),
                                          ),
                                        );
                                      },
                                      style:
                                          ElevatedButton
                                              .styleFrom(
                                        backgroundColor:
                                            const Color(
                                                0xFF3B82F6),
                                        foregroundColor:
                                            Colors.white,
                                      ),
                                      child: const Text(
                                        "Registrar",
                                      ),
                                    ),
                                  ),
                                ],
                              )
                            ],
                          ),
                        ),
                ),
              ],
            ),
    );
  }
}