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

/** Estados de la interfaz en el flujo de autenticación */
sealed interface AuthUiState {
    /** Estado inicial, sin ninguna operación en curso */
    object Idle : AuthUiState

    /** Hay una operación de autenticación en curso */
    object Loading : AuthUiState

    /**
     * La operación terminó bien
     *
     * @property usuario Datos del usuario autenticado o recién creado
     */
    data class Success(val usuario: UsuarioResponse) : AuthUiState

    /**
     * La autenticación o el registro fallaron
     *
     * @property message Mensaje de error para mostrar al usuario
     */
    data class Error(val message: String) : AuthUiState
}

/** [ViewModel] del inicio de sesión, el registro de usuarios y el cierre de sesión */
class AuthViewModel : ViewModel() {

    private companion object {
        private const val TAG = "AuthViewModel"
    }

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)

    /** Estado de la autenticación que observa la interfaz */
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    /**
     * Inicia sesión con `POST /usuarios/login` y guarda al usuario en [SesionUsuario]
     *
     * @param correo Correo electrónico introducido por el usuario
     * @param contrasena Contraseña introducida por el usuario
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
     * Registra a un usuario nuevo con `POST /usuarios`; no inicia sesión
     *
     * @param nombre Nombre del nuevo usuario
     * @param apellido Apellido del nuevo usuario
     * @param correo Correo electrónico para la cuenta
     * @param contrasena Contraseña elegida
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

    /** Cierra la sesión con `POST /usuarios/logout`; aunque falle, borra las cookies y la sesión local */
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

    /** Regresa el estado a [AuthUiState.Idle] */
    fun resetState() {
        _uiState.value = AuthUiState.Idle
    }
}
