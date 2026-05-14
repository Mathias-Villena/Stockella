import 'package:dio/dio.dart';
import '../constants/api_constants.dart';
import '../storage/token_storage.dart';

class MovementService {
  final Dio dio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl));

  Future<bool> registrarMovimiento({
    required int idProducto,
    required String tipo,
    required int cantidad,
    String? motivo,
  }) async {
    try {
      final token = await TokenStorage.getToken();

      await dio.post(
        "/movimientos",
        data: {
          "id_producto": idProducto,
          "tipo": tipo, // Entrada o Salida
          "cantidad": cantidad,
          "motivo": motivo ?? "",
        },
        options: Options(
          headers: {"Authorization": "Bearer $token"},
        ),
      );

      return true;
    } catch (e) {
      print("❌ Error registrando movimiento: $e");
      return false;
    }
  }
}