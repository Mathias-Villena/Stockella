import 'package:flutter/material.dart';

class NotificationSettingsScreen extends StatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  State<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends State<NotificationSettingsScreen> {
  bool stockBajo = true;
  bool sonido = true;
  bool vibracion = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("Notificaciones"),
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          SwitchListTile(
            value: stockBajo,
            onChanged: (v) => setState(() => stockBajo = v),
            title: const Text("Alertas de stock bajo"),
          ),
          SwitchListTile(
            value: sonido,
            onChanged: (v) => setState(() => sonido = v),
            title: const Text("Sonido"),
          ),
          SwitchListTile(
            value: vibracion,
            onChanged: (v) => setState(() => vibracion = v),
            title: const Text("Vibración"),
          ),
        ],
      ),
    );
  }
}