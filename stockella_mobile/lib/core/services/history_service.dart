import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/token_storage.dart';

class HistoryService {
  final Dio dio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));

  Future<List<dynamic>> listarMovimientos() async {
    try {
      final token = await TokenStorage.getToken();

      final response = await dio.get(
        "/movimientos",
        options: Options(
          headers: {
            "Authorization": "Bearer $token",
          },
        ),
      );

      return response.data;
    } catch (e) {
      print("❌ Error listando historial: $e");
      return [];
    }
  }
}