package mx.itesm.myapplication.viewModel

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import mx.itesm.myapplication.data.network.ApiClient
import mx.itesm.myapplication.data.network.SesionUsuario
import mx.itesm.myapplication.data.network.models.UsuarioCreateRequest
import mx.itesm.myapplication.data.network.models.UsuarioLoginRequest
import mx.itesm.myapplication.data.network.models.UsuarioResponse
import retrofit2.HttpException
import java.io.IOException

/**
 * Representa los diferentes estados de la interfaz de usuario en el flujo de autenticación.
 */
sealed interface AuthUiState {
    /** Estado inactivo inicial o en espera. */
    object Idle : AuthUiState

    /** Estado indicando que una operación asíncrona de autenticación está en progreso. */
    object Loading : AuthUiState

    /**
     * Estado que indica que la operación fue exitosa.
     *
     * @property usuario Objeto [UsuarioResponse] con los datos del usuario autenticado.
     */
    data class Success(val usuario: UsuarioResponse) : AuthUiState

    /**
     * Estado que representa un fallo en la autenticación o registro.
     *
     * @property message Descripción legible del mensaje de error.
     */
    data class Error(val message: String) : AuthUiState
}

/**
 * [ViewModel] encargado de gestionar la lógica de negocio y el estado UI para
 * los flujos de inicio de sesión, registro de usuarios y cierre de sesión.
 */
class AuthViewModel : ViewModel() {

    private companion object {
        private const val TAG = "AuthViewModel"
    }

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)

    /** Estado reactivo expuesto a la interfaz de usuario. */
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    /**
     * Inicia sesión llamando al servicio REST del backend.
     *
     * @param correo Correo electrónico introducido por el usuario.
     * @param contrasena Contraseña introducida por el usuario.
     */
    fun login(correo: String, contrasena: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            try {
                val request = UsuarioLoginRequest(correo = correo, contrasena = contrasena)
                val response = ApiClient.apiService.login(request)
                if (response.isSuccessful && response.body() != null) {
                    val usuario = response.body()!!
                    SesionUsuario.establecer(usuario)
                    _uiState.value = AuthUiState.Success(usuario)
                } else {
                    val rawError = response.errorBody()?.string()
                    Log.e(TAG, "Error en login (HTTP ${response.code()}): $rawError")
                    val errorMsg = when (response.code()) {
                        500 -> "Error interno del servidor (500). Intenta más tarde o verifica la base de datos."
                        401, 403 -> "Correo o contraseña incorrectos"
                        else -> rawError?.takeIf { it.isNotBlank() } ?: "Error de autenticación (${response.code()})"
                    }
                    _uiState.value = AuthUiState.Error(errorMsg)
                }
            } catch (e: HttpException) {
                Log.e(TAG, "HttpException en login: ${e.message()}", e)
                _uiState.value = AuthUiState.Error("Error de servidor (${e.code()})")
            } catch (e: IOException) {
                Log.e(TAG, "IOException en login: ${e.localizedMessage}", e)
                _uiState.value = AuthUiState.Error("Error de conexión. Verifica tu red o servidor.")
            } catch (e: Exception) {
                Log.e(TAG, "Excepción en login: ${e.localizedMessage}", e)
                _uiState.value = AuthUiState.Error(e.localizedMessage ?: "Error de conexión")
            }
        }
    }

    /**
     * Registra a un nuevo usuario en la plataforma.
     *
     * @param nombre Nombre del nuevo usuario.
     * @param apellido Apellido del nuevo usuario.
     * @param correo Correo electrónico para la cuenta.
     * @param contrasena Contraseña elegida.
     */
    fun registrar(nombre: String, apellido: String, correo: String, contrasena: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            try {
                val request = UsuarioCreateRequest(
                    nombre = nombre,
                    apellido = apellido,
                    correo = correo,
                    contrasena = contrasena
                )
                val response = ApiClient.apiService.crearUsuario(request)
                if (response.isSuccessful && response.body() != null) {
                    _uiState.value = AuthUiState.Success(response.body()!!)
                } else {
                    val rawError = response.errorBody()?.string()
                    Log.e(TAG, "Error en registro (HTTP ${response.code()}): $rawError")
                    val errorMsg = when (response.code()) {
                        500 -> "Error interno del servidor (500) al registrar."
                        400 -> rawError?.takeIf { it.isNotBlank() } ?: "Datos de registro inválidos"
                        409 -> "El correo ya se encuentra registrado"
                        else -> rawError?.takeIf { it.isNotBlank() } ?: "Error al registrar usuario (${response.code()})"
                    }
                    _uiState.value = AuthUiState.Error(errorMsg)
                }
            } catch (e: HttpException) {
                Log.e(TAG, "HttpException en registro: ${e.message()}", e)
                _uiState.value = AuthUiState.Error("Error del servidor (${e.code()})")
            } catch (e: IOException) {
                Log.e(TAG, "IOException en registro: ${e.localizedMessage}", e)
                _uiState.value = AuthUiState.Error("Error de conexión. Verifica tu red o servidor.")
            } catch (e: Exception) {
                Log.e(TAG, "Excepción en registro: ${e.localizedMessage}", e)
                _uiState.value = AuthUiState.Error(e.localizedMessage ?: "Error de conexión")
            }
        }
    }

    /**
     * Cierra la sesión del usuario enviando la solicitud de logout y limpiando las cookies de la aplicación.
     */
    fun logout() {
        viewModelScope.launch {
            try {
                ApiClient.apiService.logout()
            } catch (e: Exception) {
                Log.w(TAG, "Error en logout: ${e.localizedMessage}")
            } finally {
                ApiClient.clearCookies()
                SesionUsuario.limpiar()
                _uiState.value = AuthUiState.Idle
            }
        }
    }

    /**
     * Restablece el estado de la interfaz de usuario a [AuthUiState.Idle].
     */
    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }
}
