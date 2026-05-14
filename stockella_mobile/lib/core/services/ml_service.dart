import 'package:dio/dio.dart';
import '../constants/api_constants.dart';

class MlService {
  final Dio dio = Dio(BaseOptions(baseUrl: ApiConstants.mlUrl));

  Future<Map<String, dynamic>?> predecirProducto(String imagePath) async {
    try {
      final formData = FormData.fromMap({
        "file": await MultipartFile.fromFile(
          imagePath,
          filename: "producto.jpg",
        ),
      });

      final response = await dio.post(
        "/predict",
        data: formData,
        options: Options(
          headers: {"Content-Type": "multipart/form-data"},
        ),
      );

      return Map<String, dynamic>.from(response.data);
    } catch (e) {
      print("❌ Error ML: $e");
      return null;
    }
  }
}