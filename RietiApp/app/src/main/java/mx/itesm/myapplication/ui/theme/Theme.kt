package mx.itesm.myapplication.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

private val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40

    /* Other default colors to override
    background = Color(0xFFFFFBFE),
    surface = Color(0xFFFFFBFE),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = Color(0xFF1C1B1F),
    onSurface = Color(0xFF1C1B1F),
    */
)

private val EsquemaClaro = lightColorScheme(
    primary = TurquesaProfundo, onPrimary = Color.White,
    primaryContainer = TurquesaSuave, onPrimaryContainer = Tinta,
    secondary = Violeta, onSecondary = Color.White,
    secondaryContainer = VioletaSuave, onSecondaryContainer = Tinta,
    background = Fondo, onBackground = Tinta,
    surface = Color.White, onSurface = Tinta,
    surfaceVariant = Color(0xFFEEF1F6), onSurfaceVariant = TintaSecundaria,
    surfaceContainerLowest = Color.White,
    surfaceContainerLow = Color(0xFFF1F4F9),
    surfaceContainer = Color(0xFFEEF1F7),
    surfaceContainerHigh = Color(0xFFE9EDF4),
    surfaceContainerHighest = Color(0xFFE3E8F0),
    outline = Color(0xFF8A869C), outlineVariant = Linea,
    error = Alerta, onError = Color.White,
    errorContainer = AlertaSuave, onErrorContainer = Color(0xFF410E0B)
)

// Esquinas con jerarquía: campos y chips más cerradas, tarjetas y paneles más redondeadas.
private val Formas = Shapes(
    extraSmall = RoundedCornerShape(12.dp), // campos de texto
    small = RoundedCornerShape(10.dp),      // chips
    medium = RoundedCornerShape(16.dp),     // tarjetas
    large = RoundedCornerShape(24.dp)       // paneles y opciones grandes
)

@Composable
fun MyApplicationTheme(
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = EsquemaClaro, typography = Tipografia, shapes = Formas, content = content)

}