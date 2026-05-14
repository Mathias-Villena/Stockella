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
      body: jsonEncode({
        "email": email,
        "password": password,
      }),
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
}