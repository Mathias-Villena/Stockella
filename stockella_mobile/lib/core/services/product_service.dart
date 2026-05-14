import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/token_storage.dart';

class ProductService {
  final Dio dio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));

  Future<Map<String, dynamic>?> buscarPorCodigo(String codigo) async {
    try {
      final token = await TokenStorage.getToken();

      final response = await dio.get(
        '/productos/codigo/$codigo',
        options: Options(
          headers: {
            "Authorization": "Bearer $token",
          },
        ),
      );

      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      print("❌ Error buscando producto: $e");
      return null;
    }
  }
  Future<Map<String, dynamic>?> buscarPorNombre(String nombre) async {
  try {
    final token = await TokenStorage.getToken();

    final response = await dio.get(
      '/productos',
      queryParameters: {
        "q": nombre,
        "page": 1,
        "limit": 10,
      },
      options: Options(
        headers: {
          "Authorization": "Bearer $token",
        },
      ),
    );

    final data = response.data["data"] as List;

    if (data.isEmpty) return null;

    return Map<String, dynamic>.from(data.first);
  } catch (e) {
    print("❌ Error buscando producto por nombre: $e");
    return null;
  }
}
}