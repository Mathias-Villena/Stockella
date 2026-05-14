import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/token_storage.dart';

class AlertService {
  final Dio dio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));

  Future<List<dynamic>> listarAlertas({bool atendida = false}) async {
    try {
      final token = await TokenStorage.getToken();

      final response = await dio.get(
        "/alertas",
        queryParameters: {"atendida": atendida},
        options: Options(headers: {"Authorization": "Bearer $token"}),
      );

      return response.data;
    } catch (e) {
      print("❌ Error listando alertas: $e");
      return [];
    }
  }

  Future<bool> marcarAtendida(int idAlerta) async {
    try {
      final token = await TokenStorage.getToken();

      await dio.put(
        "/alertas/$idAlerta/atender",
        options: Options(headers: {"Authorization": "Bearer $token"}),
      );

      return true;
    } catch (e) {
      print("❌ Error atendiendo alerta: $e");
      return false;
    }
  }
}