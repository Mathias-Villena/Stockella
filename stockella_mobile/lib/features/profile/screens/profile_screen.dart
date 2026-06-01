import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/storage/token_storage.dart';
import '../../auth/screens/login_screen.dart';
import 'edit_profile_screen.dart';
import 'change_password_screen.dart';
import 'help_center_screen.dart';
import 'notification_settings_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, String?> user = {};

  @override
  void initState() {
    super.initState();
    loadUser();
  }

  Future<void> loadUser() async {
    final data = await TokenStorage.getUser();
    setState(() => user = data);
  }

  Future<void> logout(BuildContext context) async {
    await TokenStorage.clear();

    if (!context.mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  String initials(String? nombre) {
    if (nombre == null || nombre.trim().isEmpty) return "US";

    return nombre
        .trim()
        .split(" ")
        .map((p) => p[0])
        .take(2)
        .join()
        .toUpperCase();
  }

  void openLanguageModal() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                "Idioma",
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 18),
              ListTile(
                leading: const Icon(LucideIcons.languages),
                title: const Text("Español"),
                subtitle: const Text("Idioma actual"),
                trailing: const Icon(LucideIcons.checkCircle, color: Colors.green),
                onTap: () => Navigator.pop(context),
              ),
              const SizedBox(height: 10),
              const Text(
                "Más idiomas estarán disponibles próximamente.",
                style: TextStyle(color: Color(0xFF6B7280)),
              ),
              const SizedBox(height: 18),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final nombre = user["nombre"] ?? "Usuario";
    final email = user["email"] ?? "-";
    final rol = user["rol"] ?? "-";

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(18),
          children: [
            const Text(
              "Perfil",
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w800,
                color: Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              "Administra tu cuenta y preferencias",
              style: TextStyle(color: Color(0xFF6B7280)),
            ),
            const SizedBox(height: 24),

            Container(
              padding: const EdgeInsets.all(22),
              decoration: _cardDecoration(),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 42,
                    backgroundColor: const Color(0xFF2563EB),
                    child: Text(
                      initials(nombre),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    nombre,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    email,
                    style: const TextStyle(color: Color(0xFF6B7280)),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDBEAFE),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      rol,
                      style: const TextStyle(
                        color: Color(0xFF2563EB),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            Container(
              decoration: _cardDecoration(),
              child: Column(
                children: [
                  _OptionTile(
                    icon: LucideIcons.userCog,
                    title: "Editar Perfil",
                    subtitle: "Actualizar nombre de usuario",
                    onTap: () async {
                      final updated = await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => EditProfileScreen(
                            nombre: nombre,
                            email: email,
                            rol: rol,
                          ),
                        ),
                      );

                      if (updated == true) {
                        loadUser();
                      }
                    },
                  ),
                  _divider(),
                  _OptionTile(
                    icon: LucideIcons.bell,
                    title: "Notificaciones",
                    subtitle: "Preferencias de alertas locales",
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const NotificationSettingsScreen(),
                        ),
                      );
                    },
                  ),
                  _divider(),
                  _OptionTile(
                    icon: LucideIcons.languages,
                    title: "Idioma",
                    subtitle: "Español",
                    onTap: openLanguageModal,
                  ),
                  _divider(),
                  _OptionTile(
                    icon: LucideIcons.lock,
                    title: "Cambiar Contraseña",
                    subtitle: "Actualiza tu contraseña de acceso",
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const ChangePasswordScreen(),
                        ),
                      );
                    },
                  ),
                  _divider(),
                  _OptionTile(
                    icon: LucideIcons.helpCircle,
                    title: "Centro de Ayuda",
                    subtitle: "Guía rápida y soporte",
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const HelpCenterScreen(),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            ElevatedButton.icon(
              onPressed: () => logout(context),
              icon: const Icon(LucideIcons.logOut),
              label: const Text("Cerrar sesión"),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFEF4444),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),

            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.06),
          blurRadius: 12,
          offset: const Offset(0, 5),
        ),
      ],
    );
  }

  Widget _divider() {
    return const Divider(height: 1, indent: 70);
  }
}

class _OptionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _OptionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: const Color(0xFFEFF6FF),
        child: Icon(icon, color: const Color(0xFF2563EB)),
      ),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.w700),
      ),
      subtitle: Text(subtitle),
      trailing: const Icon(
        LucideIcons.chevronRight,
        size: 20,
        color: Color(0xFF9CA3AF),
      ),
    );
  }
}