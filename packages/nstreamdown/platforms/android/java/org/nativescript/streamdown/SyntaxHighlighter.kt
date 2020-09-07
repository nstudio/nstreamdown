package org.nativescript.streamdown

import android.graphics.Color
import android.graphics.Typeface
import android.os.Handler
import android.os.Looper
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.BackgroundColorSpan
import android.text.style.ForegroundColorSpan
import android.text.style.StyleSpan
import android.text.style.TypefaceSpan
import android.widget.TextView
import java.util.concurrent.Executors
import java.util.regex.Pattern

/**
 * Token types for syntax highlighting
 */
enum class SyntaxTokenType {
    KEYWORD,
    STRING,
    NUMBER,
    COMMENT,
    FUNCTION,
    TYPE,
    PROPERTY,
    PUNCTUATION,
    PLAIN
}

/**
 * Color scheme for syntax highlighting
 */
data class ColorScheme(
    val keyword: Int,
    val string: Int,
    val number: Int,
    val comment: Int,
    val function: Int,
    val type: Int,
    val property: Int,
    val punctuation: Int,
    val plain: Int,
    val background: Int
)

/**
 * Syntax highlighter for NativeScript Streamdown
 * Uses Android SpannableString for efficient rendering
 */
class SyntaxHighlighter private constructor() {

    companion object {
        private val _instance: SyntaxHighlighter by lazy { SyntaxHighlighter() }
        
        @JvmStatic
        fun getShared(): SyntaxHighlighter = _instance

        // Dark color scheme (matching iOS VSCode-like colors)
        private val _darkScheme = ColorScheme(
            keyword = Color.rgb(86, 156, 214),      // #569CD6 - blue
            string = Color.rgb(206, 145, 120),      // #CE9178 - salmon/orange
            number = Color.rgb(181, 206, 168),      // #B5CEA8 - light green
            comment = Color.rgb(106, 153, 85),      // #6A9955 - green
            function = Color.rgb(220, 220, 170),    // #DCDCAA - yellow
            type = Color.rgb(78, 201, 176),         // #4EC9B0 - teal/cyan
            property = Color.rgb(156, 220, 254),    // #9CDCFE - light blue
            punctuation = Color.rgb(212, 212, 212), // #D4D4D4 - light gray
            plain = Color.rgb(212, 212, 212),       // #D4D4D4 - light gray
            background = Color.rgb(30, 30, 30)      // #1E1E1E - dark (VSCode dark)
        )

        @JvmStatic
        fun getDarkScheme(): ColorScheme = _darkScheme

        // Light color scheme (VSCode light-like colors)
        private val _lightScheme = ColorScheme(
            keyword = Color.rgb(0, 0, 255),         // #0000FF - blue
            string = Color.rgb(163, 21, 21),        // #A31515 - dark red
            number = Color.rgb(9, 136, 90),         // #09885A - green
            comment = Color.rgb(0, 128, 0),         // #008000 - green
            function = Color.rgb(121, 94, 38),      // #795E26 - brown
            type = Color.rgb(38, 127, 153),         // #267F99 - teal
            property = Color.rgb(0, 16, 128),       // #001080 - dark blue
            punctuation = Color.rgb(0, 0, 0),       // #000000 - black
            plain = Color.rgb(0, 0, 0),             // #000000 - black
            background = Color.rgb(255, 255, 255)   // #FFFFFF - white
        )

        @JvmStatic
        fun getLightScheme(): ColorScheme = _lightScheme

        // Language keywords
        private val swiftKeywords = setOf(
            "import", "class", "struct", "enum", "protocol", "extension", "func", "var", "let",
            "if", "else", "guard", "switch", "case", "default", "for", "while", "repeat", "do",
            "break", "continue", "return", "throw", "try", "catch", "defer", "in", "where",
            "as", "is", "nil", "true", "false", "self", "Self", "super", "init", "deinit",
            "get", "set", "willSet", "didSet", "throws", "rethrows", "async", "await",
            "override", "final", "static", "private", "public", "internal", "open", "fileprivate",
            "mutating", "nonmutating", "lazy", "weak", "unowned", "optional", "required",
            "convenience", "dynamic", "infix", "prefix", "postfix", "operator", "associatedtype",
            "typealias", "some", "any", "@objc", "@objcMembers", "@escaping", "@MainActor"
        )

        private val tsKeywords = setOf(
            "const", "let", "var", "function", "class", "interface", "type", "enum",
            "if", "else", "for", "while", "do", "switch", "case", "default", "break", "continue",
            "return", "throw", "try", "catch", "finally", "new", "delete", "typeof", "instanceof",
            "import", "export", "from", "default", "as", "async", "await", "yield",
            "this", "super", "extends", "implements", "static", "get", "set",
            "public", "private", "protected", "readonly", "abstract", "declare",
            "null", "undefined", "true", "false", "void", "never", "any", "unknown",
            "string", "number", "boolean", "object", "symbol", "bigint"
        )

        private val pythonKeywords = setOf(
            "def", "class", "if", "elif", "else", "for", "while", "try", "except", "finally",
            "with", "as", "import", "from", "return", "yield", "raise", "pass", "break", "continue",
            "and", "or", "not", "in", "is", "lambda", "global", "nonlocal", "assert", "del",
            "True", "False", "None", "async", "await", "self", "cls"
        )

        private val javaKeywords = setOf(
            "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class",
            "const", "continue", "default", "do", "double", "else", "enum", "extends", "final",
            "finally", "float", "for", "goto", "if", "implements", "import", "instanceof", "int",
            "interface", "long", "native", "new", "package", "private", "protected", "public",
            "return", "short", "static", "strictfp", "super", "switch", "synchronized", "this",
            "throw", "throws", "transient", "try", "void", "volatile", "while", "true", "false", "null"
        )

        private val kotlinKeywords = setOf(
            "abstract", "actual", "annotation", "as", "break", "by", "catch", "class", "companion",
            "const", "constructor", "continue", "crossinline", "data", "do", "dynamic", "else",
            "enum", "expect", "external", "false", "final", "finally", "for", "fun", "get", "if",
            "import", "in", "infix", "init", "inline", "inner", "interface", "internal", "is",
            "lateinit", "noinline", "null", "object", "open", "operator", "out", "override",
            "package", "private", "protected", "public", "reified", "return", "sealed", "set",
            "super", "suspend", "tailrec", "this", "throw", "true", "try", "typealias", "typeof",
            "val", "var", "vararg", "when", "where", "while"
        )

        private val goKeywords = setOf(
            "break", "case", "chan", "const", "continue", "default", "defer", "else", "fallthrough",
            "for", "func", "go", "goto", "if", "import", "interface", "map", "package", "range",
            "return", "select", "struct", "switch", "type", "var", "true", "false", "nil", "iota"
        )

        private val rustKeywords = setOf(
            "as", "async", "await", "break", "const", "continue", "crate", "dyn", "else", "enum",
            "extern", "false", "fn", "for", "if", "impl", "in", "let", "loop", "match", "mod",
            "move", "mut", "pub", "ref", "return", "self", "Self", "static", "struct", "super",
            "trait", "true", "type", "unsafe", "use", "where", "while"
        )

        private val cppKeywords = setOf(
            "alignas", "alignof", "and", "and_eq", "asm", "auto", "bitand", "bitor", "bool", "break",
            "case", "catch", "char", "char16_t", "char32_t", "class", "compl", "const", "constexpr",
            "const_cast", "continue", "decltype", "default", "delete", "do", "double", "dynamic_cast",
            "else", "enum", "explicit", "export", "extern", "false", "float", "for", "friend", "goto",
            "if", "inline", "int", "long", "mutable", "namespace", "new", "noexcept", "not", "not_eq",
            "nullptr", "operator", "or", "or_eq", "private", "protected", "public", "register",
            "reinterpret_cast", "return", "short", "signed", "sizeof", "static", "static_assert",
            "static_cast", "struct", "switch", "template", "this", "thread_local", "throw", "true",
            "try", "typedef", "typeid", "typename", "union", "unsigned", "using", "virtual", "void",
            "volatile", "wchar_t", "while", "xor", "xor_eq", "#include", "#define", "#ifdef", "#endif"
        )

        private val swiftTypes = setOf(
            "Int", "String", "Bool", "Double", "Float", "Character", "Array", "Dictionary",
            "Set", "Optional", "Any", "AnyObject", "Void", "Never", "Result", "Error",
            "UIView", "UIViewController", "UILabel", "UIButton", "UIImage", "UIColor",
            "CGRect", "CGPoint", "CGSize", "CGFloat", "NSObject", "NSString", "NSArray"
        )

        private val tsTypes = setOf(
            "Array", "Object", "String", "Number", "Boolean", "Function", "Promise",
            "Map", "Set", "WeakMap", "WeakSet", "Date", "RegExp", "Error", "Symbol",
            "Record", "Partial", "Required", "Readonly", "Pick", "Omit", "Exclude", "Extract",
            "Component", "Observable", "Subject", "EventEmitter"
        )

        // Pre-compiled regex patterns
        private val stringPattern = Pattern.compile("\"[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*\"|'[^'\\\\]*(?:\\\\.[^'\\\\]*)*'|`[^`]*`")
        private val commentPattern = Pattern.compile("//[^\\n]*|/\\*[\\s\\S]*?\\*/|#[^\\n]*")
        private val numberPattern = Pattern.compile("\\b\\d+\\.?\\d*\\b")
        private val wordPattern = Pattern.compile("\\b[a-zA-Z_\$][a-zA-Z0-9_\$]*\\b")
        private val decoratorPattern = Pattern.compile("@[a-zA-Z_][a-zA-Z0-9_]*")
        
        // Decorator color (purple/magenta like VSCode) - #C586C0
        private val decoratorColor = Color.rgb(197, 134, 192)
    }

    private val executors = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())

    /**
     * Highlight code synchronously
     */
    @JvmOverloads
    fun highlight(code: String, language: String, scheme: ColorScheme = _darkScheme): SpannableStringBuilder {
        val spannableString = SpannableStringBuilder(code)

        // Get keywords and types for the language
        val (keywords, types) = when (language.lowercase()) {
            "swift" -> swiftKeywords to swiftTypes
            "typescript", "ts", "javascript", "js" -> tsKeywords to tsTypes
            "python", "py" -> pythonKeywords to emptySet()
            "java" -> javaKeywords to emptySet()
            "kotlin", "kt" -> kotlinKeywords to emptySet()
            "go", "golang" -> goKeywords to emptySet()
            "rust", "rs" -> rustKeywords to emptySet()
            "c", "cpp", "c++", "cxx", "h", "hpp" -> cppKeywords to emptySet()
            else -> tsKeywords to tsTypes
        }

        // Apply monospace font span
        spannableString.setSpan(
            TypefaceSpan("monospace"),
            0,
            code.length,
            Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        // Base color
        spannableString.setSpan(
            ForegroundColorSpan(scheme.plain),
            0,
            code.length,
            Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
        )

        // Track colored ranges to prevent overlap
        val coloredRanges = mutableListOf<IntRange>()

        // 1. Comments first (highest precedence)
        val commentMatcher = commentPattern.matcher(code)
        while (commentMatcher.find()) {
            val range = commentMatcher.start() until commentMatcher.end()
            spannableString.setSpan(
                ForegroundColorSpan(scheme.comment),
                range.first,
                range.last + 1,
                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
            )
            spannableString.setSpan(
                StyleSpan(Typeface.ITALIC),
                range.first,
                range.last + 1,
                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
            )
            coloredRanges.add(range)
        }

        // 2. Strings
        val stringMatcher = stringPattern.matcher(code)
        while (stringMatcher.find()) {
            val range = stringMatcher.start() until stringMatcher.end()
            if (!coloredRanges.any { it.overlaps(range) }) {
                spannableString.setSpan(
                    ForegroundColorSpan(scheme.string),
                    range.first,
                    range.last + 1,
                    Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                )
                coloredRanges.add(range)
            }
        }

        // 3. Decorators/Annotations (@Component, @objc, etc.)
        val decoratorMatcher = decoratorPattern.matcher(code)
        while (decoratorMatcher.find()) {
            val range = decoratorMatcher.start() until decoratorMatcher.end()
            if (!coloredRanges.any { it.overlaps(range) }) {
                spannableString.setSpan(
                    ForegroundColorSpan(decoratorColor),
                    range.first,
                    range.last + 1,
                    Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                )
                coloredRanges.add(range)
            }
        }

        // 4. Numbers
        val numberMatcher = numberPattern.matcher(code)
        while (numberMatcher.find()) {
            val range = numberMatcher.start() until numberMatcher.end()
            if (!coloredRanges.any { it.overlaps(range) }) {
                spannableString.setSpan(
                    ForegroundColorSpan(scheme.number),
                    range.first,
                    range.last + 1,
                    Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                )
            }
        }

        // 5. Keywords and identifiers
        val wordMatcher = wordPattern.matcher(code)
        while (wordMatcher.find()) {
            val range = wordMatcher.start() until wordMatcher.end()
            if (coloredRanges.any { it.overlaps(range) }) continue

            val word = code.substring(range.first, range.last + 1)

            when {
                keywords.contains(word) -> {
                    spannableString.setSpan(
                        ForegroundColorSpan(scheme.keyword),
                        range.first,
                        range.last + 1,
                        Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                    )
                    spannableString.setSpan(
                        StyleSpan(Typeface.BOLD),
                        range.first,
                        range.last + 1,
                        Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                    )
                }
                types.contains(word) || (word.isNotEmpty() && word[0].isUpperCase() && word.length > 1) -> {
                    spannableString.setSpan(
                        ForegroundColorSpan(scheme.type),
                        range.first,
                        range.last + 1,
                        Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                    )
                }
                else -> {
                    // Check if followed by ( for function
                    val afterWord = range.last + 1
                    if (afterWord < code.length) {
                        var idx = afterWord
                        while (idx < code.length && (code[idx] == ' ' || code[idx] == '\t')) {
                            idx++
                        }
                        if (idx < code.length && code[idx] == '(') {
                            spannableString.setSpan(
                                ForegroundColorSpan(scheme.function),
                                range.first,
                                range.last + 1,
                                Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                            )
                        }
                    }
                }
            }
        }

        return spannableString
    }

    /**
     * Full highlight with tokenization (alias for highlight)
     */
    @JvmOverloads
    fun highlightFull(code: String, language: String, scheme: ColorScheme = _darkScheme): SpannableStringBuilder {
        return highlight(code, language, scheme)
    }

    /**
     * Highlight code asynchronously and update a TextView
     */
    @JvmOverloads
    fun highlightAsync(
        code: String,
        language: String,
        textView: TextView,
        scheme: ColorScheme = _darkScheme
    ) {
        executors.execute {
            val highlighted = highlight(code, language, scheme)
            mainHandler.post {
                textView.text = highlighted
            }
        }
    }

    /**
     * Highlight code asynchronously with callback
     */
    interface HighlightCallback {
        fun onComplete(result: SpannableStringBuilder)
    }

    @JvmOverloads
    fun highlightAsync(
        code: String,
        language: String,
        callback: HighlightCallback,
        scheme: ColorScheme = _darkScheme
    ) {
        executors.execute {
            val highlighted = highlight(code, language, scheme)
            mainHandler.post {
                callback.onComplete(highlighted)
            }
        }
    }

    // Extension function to check if ranges overlap
    private fun IntRange.overlaps(other: IntRange): Boolean {
        return this.first <= other.last && other.first <= this.last
    }
}
