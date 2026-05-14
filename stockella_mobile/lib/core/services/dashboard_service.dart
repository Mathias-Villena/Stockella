import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/token_storage.dart';

class DashboardService {
  final Dio dio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));

  Future<Map<String, dynamic>?> obtenerResumen() async {
    try {
      final token = await TokenStorage.getToken();

      final response = await dio.get(
        "/dashboard/resumen",
        options: Options(
          headers: {
            "Authorization": "Bearer $token",
          },
        ),
      );

      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      print("❌ Error obteniendo dashboard: $e");
      return null;
    }
  }
}