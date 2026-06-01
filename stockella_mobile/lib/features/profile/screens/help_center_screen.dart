import 'package:flutter/material.dart';

class HelpCenterScreen extends StatelessWidget {
  const HelpCenterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("Centro de Ayuda"),
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
      ),
      body: const Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Stockella", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            SizedBox(height: 10),
            Text("Sistema móvil de gestión inteligente de inventario."),
            SizedBox(height: 25),
            Text("Funciones principales", style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 10),
            Text("• Escaneo por código de barras"),
            Text("• Reconocimiento visual con IA"),
            Text("• Registro de entradas y salidas"),
            Text("• Consulta de historial"),
            Text("• Alertas de stock bajo"),
            SizedBox(height: 25),
            Text("Soporte", style: TextStyle(fontWeight: FontWeight.bold)),
            SizedBox(height: 10),
            Text("Correo: soporte@stockella.com"),
            SizedBox(height: 25),
            Text("Versión: 1.0.0"),
          ],
        ),
      ),
    );
  }
}