import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  static const String _tokenKey = "stk_token";
  static const String _nameKey = "stk_name";
  static const String _emailKey = "stk_email";
  static const String _roleKey = "stk_role";

  static Future<void> saveSession({
    required String token,
    required String nombre,
    required String email,
    required String rol,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
    await prefs.setString(_nameKey, nombre);
    await prefs.setString(_emailKey, email);
    await prefs.setString(_roleKey, rol);
  }

  static Future<void> updateUser({
    required String nombre,
    required String email,
    required String rol,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_nameKey, nombre);
    await prefs.setString(_emailKey, email);
    await prefs.setString(_roleKey, rol);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  static Future<Map<String, String?>> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      "nombre": prefs.getString(_nameKey),
      "email": prefs.getString(_emailKey),
      "rol": prefs.getString(_roleKey),
    };
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
  }
}