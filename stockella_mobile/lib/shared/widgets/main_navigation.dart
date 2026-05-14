import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../features/home/screens/home_screen.dart';
import '../../features/scanner/screens/scanner_screen.dart';
import '../../features/history/screens/history_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import '../../features/alerts/screens/alerts_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int index = 0;

  final screens = const [
    HomeScreen(),
    ScannerScreen(),
    HistoryScreen(),
    AlertsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: screens[index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) {
          setState(() => index = value);
        },
        destinations: const [
          NavigationDestination(icon: Icon(LucideIcons.home), label: "Inicio"),
          NavigationDestination(
            icon: Icon(LucideIcons.camera),
            label: "Escanear",
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.history),
            label: "Historial",
          ),
          NavigationDestination(
            icon: Icon(LucideIcons.alertTriangle),
            label: "Alertas",
          ),
          NavigationDestination(icon: Icon(LucideIcons.user), label: "Perfil"),
        ],
      ),
    );
  }
}
