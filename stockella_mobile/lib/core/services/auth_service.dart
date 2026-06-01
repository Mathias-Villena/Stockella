import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../storage/token_storage.dart';

class AuthService {
  static Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final url = Uri.parse("${ApiConstants.baseUrl}/auth/login");

    final response = await http.post(
      url,
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"email": email, "password": password}),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode != 200) {
      throw Exception(data["message"] ?? "Error al iniciar sesión");
    }

    final usuario = data["usuario"];

    await TokenStorage.saveSession(
      token: data["token"],
      nombre: usuario["nombre"],
      email: usuario["email"],
      rol: usuario["rol"],
    );

    return data;
  }

  static Future<Map<String, dynamic>> me() async {
    final token = await TokenStorage.getToken();

    final response = await http.get(
      Uri.parse("${ApiConstants.baseUrl}/auth/me"),
      headers: {"Authorization": "Bearer $token"},
    );

    final data = jsonDecode(response.body);

    if (response.statusCode != 200) {
      throw Exception(data["error"] ?? "Error obteniendo perfil");
    }

    await TokenStorage.saveSession(
      token: token ?? "",
      nombre: data["nombre"],
      email: data["email"],
      rol: data["rol"],
    );

    return data;
  }

  static Future<Map<String, dynamic>> actualizarPerfil({
    required String nombre,
  }) async {
    final token = await TokenStorage.getToken();

    final response = await http.put(
      Uri.parse("${ApiConstants.baseUrl}/auth/perfil"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
      body: jsonEncode({"nombre": nombre}),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode != 200) {
      throw Exception(data["error"] ?? "Error actualizando perfil");
    }

    final usuario = data["usuario"];

    await TokenStorage.saveSession(
      token: token ?? "",
      nombre: usuario["nombre"],
      email: usuario["email"],
      rol: usuario["rol"],
    );

    return data;
  }

  static Future<void> cambiarPassword({
    required String actual,
    required String nueva,
  }) async {
    final token = await TokenStorage.getToken();

    final response = await http.put(
      Uri.parse("${ApiConstants.baseUrl}/auth/cambiar-password"),
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
      },
      body: jsonEncode({
        "actual": actual,
        "nueva": nueva,
      }),
    );

    final data = jsonDecode(response.body);

    if (response.statusCode != 200) {
      throw Exception(data["error"] ?? "Error cambiando contraseña");
    }
  }
}