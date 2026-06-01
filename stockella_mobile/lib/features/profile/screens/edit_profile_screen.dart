import 'package:flutter/material.dart';
import '../../../core/services/auth_service.dart';

class EditProfileScreen extends StatefulWidget {
  final String nombre;
  final String email;
  final String rol;

  const EditProfileScreen({
    super.key,
    required this.nombre,
    required this.email,
    required this.rol,
  });

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController nombreController;
  bool loading = false;

  @override
  void initState() {
    super.initState();
    nombreController = TextEditingController(text: widget.nombre);
  }

  Future<void> guardar() async {
    if (nombreController.text.trim().isEmpty) return;

    setState(() => loading = true);

    try {
      await AuthService.actualizarPerfil(nombre: nombreController.text.trim());

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Perfil actualizado correctamente")),
      );

      Navigator.pop(context, true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll("Exception:", ""))),
      );
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text("Editar Perfil"),
        backgroundColor: const Color(0xFFF8FAFC),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          const Text("Nombre"),
          const SizedBox(height: 8),
          TextField(
            controller: nombreController,
            decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
          const SizedBox(height: 18),
          const Text("Email"),
          const SizedBox(height: 8),
          TextField(
            enabled: false,
            controller: TextEditingController(text: widget.email),
            decoration: InputDecoration(
              filled: true,
              fillColor: Colors.grey.shade100,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
          const SizedBox(height: 18),
          const Text("Rol"),
          const SizedBox(height: 8),
          TextField(
            enabled: false,
            controller: TextEditingController(text: widget.rol),
            decoration: InputDecoration(
              filled: true,
              fillColor: Colors.grey.shade100,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
            ),
          ),
          const SizedBox(height: 30),
          ElevatedButton(
            onPressed: loading ? null : guardar,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 55),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: Text(loading ? "Guardando..." : "Guardar cambios"),
          ),
        ],
      ),
    );
  }
}