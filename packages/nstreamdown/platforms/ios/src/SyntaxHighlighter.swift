import UIKit
import Foundation

/// Token types for syntax highlighting
@objc public enum SyntaxTokenType: Int {
    case keyword = 0
    case string = 1
    case number = 2
    case comment = 3
    case function = 4
    case type = 5
    case property = 6
    case punctuation = 7
    case plain = 8
}

/// Simple syntax highlighter exposed to NativeScript
/// Uses native NSAttributedString for efficient rendering
@objcMembers
public class SyntaxHighlighter: NSObject {
    
    // MARK: - Color Schemes
    
    public struct ColorScheme {
        let keyword: UIColor
        let string: UIColor
        let number: UIColor
        let comment: UIColor
        let function: UIColor
        let type: UIColor
        let property: UIColor
        let punctuation: UIColor
        let plain: UIColor
        let background: UIColor
    }
    
    public static let darkScheme = ColorScheme(
        keyword: UIColor(red: 0.75, green: 0.55, blue: 0.95, alpha: 1),     // purple
        string: UIColor(red: 0.30, green: 0.80, blue: 0.50, alpha: 1),      // green
        number: UIColor(red: 0.30, green: 0.82, blue: 0.88, alpha: 1),      // cyan
        comment: UIColor(red: 0.45, green: 0.50, blue: 0.56, alpha: 1),     // gray
        function: UIColor(red: 0.40, green: 0.65, blue: 0.95, alpha: 1),    // blue
        type: UIColor(red: 0.95, green: 0.80, blue: 0.30, alpha: 1),        // yellow
        property: UIColor(red: 0.90, green: 0.60, blue: 0.40, alpha: 1),    // orange
        punctuation: UIColor(red: 0.60, green: 0.65, blue: 0.72, alpha: 1), // light gray
        plain: UIColor(red: 0.90, green: 0.92, blue: 0.95, alpha: 1),       // white
        background: UIColor(red: 0.10, green: 0.12, blue: 0.16, alpha: 1)   // dark
    )
    
    // MARK: - Language Keywords
    
    private static let swiftKeywords: Set<String> = [
        "import", "class", "struct", "enum", "protocol", "extension", "func", "var", "let",
        "if", "else", "guard", "switch", "case", "default", "for", "while", "repeat", "do",
        "break", "continue", "return", "throw", "try", "catch", "defer", "in", "where",
        "as", "is", "nil", "true", "false", "self", "Self", "super", "init", "deinit",
        "get", "set", "willSet", "didSet", "throws", "rethrows", "async", "await",
        "override", "final", "static", "private", "public", "internal", "open", "fileprivate",
        "mutating", "nonmutating", "lazy", "weak", "unowned", "optional", "required",
        "convenience", "dynamic", "infix", "prefix", "postfix", "operator", "associatedtype",
        "typealias", "some", "any", "@objc", "@objcMembers", "@escaping", "@MainActor"
    ]
    
    private static let tsKeywords: Set<String> = [
        "const", "let", "var", "function", "class", "interface", "type", "enum",
        "if", "else", "for", "while", "do", "switch", "case", "default", "break", "continue",
        "return", "throw", "try", "catch", "finally", "new", "delete", "typeof", "instanceof",
        "import", "export", "from", "default", "as", "async", "await", "yield",
        "this", "super", "extends", "implements", "static", "get", "set",
        "public", "private", "protected", "readonly", "abstract", "declare",
        "null", "undefined", "true", "false", "void", "never", "any", "unknown",
        "string", "number", "boolean", "object", "symbol", "bigint"
    ]
    
    private static let pythonKeywords: Set<String> = [
        "def", "class", "if", "elif", "else", "for", "while", "try", "except", "finally",
        "with", "as", "import", "from", "return", "yield", "raise", "pass", "break", "continue",
        "and", "or", "not", "in", "is", "lambda", "global", "nonlocal", "assert", "del",
        "True", "False", "None", "async", "await", "self", "cls"
    ]
    
    private static let swiftTypes: Set<String> = [
        "Int", "String", "Bool", "Double", "Float", "Character", "Array", "Dictionary",
        "Set", "Optional", "Any", "AnyObject", "Void", "Never", "Result", "Error",
        "UIView", "UIViewController", "UILabel", "UIButton", "UIImage", "UIColor",
        "CGRect", "CGPoint", "CGSize", "CGFloat", "NSObject", "NSString", "NSArray"
    ]
    
    private static let tsTypes: Set<String> = [
        "Array", "Object", "String", "Number", "Boolean", "Function", "Promise",
        "Map", "Set", "WeakMap", "WeakSet", "Date", "RegExp", "Error", "Symbol",
        "Record", "Partial", "Required", "Readonly", "Pick", "Omit", "Exclude", "Extract",
        "Component", "Observable", "Subject", "EventEmitter"
    ]
    
    // MARK: - Shared Instance
    
    public static let shared = SyntaxHighlighter()
    
    private let monoFont: UIFont
    
    private override init() {
        // Use SF Mono or fallback to Menlo
        if let sfMono = UIFont(name: "SFMono-Regular", size: 13) {
            self.monoFont = sfMono
        } else {
            self.monoFont = UIFont.monospacedSystemFont(ofSize: 13, weight: .regular)
        }
        super.init()
    }
    
    // Background queue for highlighting
    private let highlightQueue = DispatchQueue(label: "com.streamdown.syntax", qos: .userInitiated)
    
    // MARK: - Public API (exposed to NativeScript)
    
    /// Highlight code and return an attributed string
    public func highlight(_ code: String, language: String) -> NSAttributedString {
        let scheme = Self.darkScheme
        let attributedString = NSMutableAttributedString(string: code)
        let fullRange = NSRange(location: 0, length: code.utf16.count)
        
        // Apply base attributes
        attributedString.addAttribute(.font, value: monoFont, range: fullRange)
        attributedString.addAttribute(.foregroundColor, value: scheme.plain, range: fullRange)
        
        // Get keywords and types for the language
        let keywords: Set<String>
        let types: Set<String>
        
        switch language.lowercased() {
        case "swift":
            keywords = Self.swiftKeywords
            types = Self.swiftTypes
        case "typescript", "ts", "javascript", "js":
            keywords = Self.tsKeywords
            types = Self.tsTypes
        case "python", "py":
            keywords = Self.pythonKeywords
            types = []
        default:
            keywords = Self.tsKeywords
            types = Self.tsTypes
        }
        
        // Tokenize and highlight
        highlightTokens(in: attributedString, code: code, keywords: keywords, types: types, scheme: scheme)
        
        return attributedString
    }
    
    /// Full highlight with tokenization (alias for highlight)
    public func highlightFull(_ code: String, language: String) -> NSAttributedString {
        return highlight(code, language: language)
    }
    
    /// Highlight code asynchronously (for NativeScript - uses callback)
    /// - Parameters:
    ///   - code: The source code to highlight
    ///   - language: The programming language
    ///   - label: The UILabel to update with the result
    public func highlightAsync(_ code: String, language: String, label: UILabel) {
        // Debug: Log immediately when method is called
        print("[SyntaxHighlighter] highlightAsync called with \(code.count) chars, language: \(language)")
        
        // Capture values for background thread
        let codeCopy = code
        let langCopy = language
        
        // Keep strong reference to label
        let labelRef = label
        
        print("[SyntaxHighlighter] About to dispatch to background queue...")
        
        highlightQueue.async { [weak self] in
            print("[SyntaxHighlighter] Inside background queue")
            guard let self = self else { 
                print("[SyntaxHighlighter] self is nil!")
                return 
            }
            
            // Do expensive highlighting on background thread
            print("[SyntaxHighlighter] Calling highlight()...")
            let attributedString = self.highlight(codeCopy, language: langCopy)
            print("[SyntaxHighlighter] Got attributed string with \(attributedString.length) chars")
            
            // Update UI on main thread
            DispatchQueue.main.async {
                print("[SyntaxHighlighter] On main thread, updating label...")
                labelRef.attributedText = attributedString
                print("[SyntaxHighlighter] Label updated!")
            }
        }
        
        print("[SyntaxHighlighter] highlightAsync returning")
    }
    
    /// Create a configured UITextView with highlighted code
    /// - Parameters:
    ///   - code: The source code to highlight
    ///   - language: The programming language
    ///   - frame: The frame for the text view
    /// - Returns: Configured UITextView
    public func createCodeView(_ code: String, language: String, frame: CGRect) -> UITextView {
        let textView = UITextView(frame: frame)
        textView.isEditable = false
        textView.isSelectable = true
        textView.backgroundColor = Self.darkScheme.background
        textView.textContainerInset = UIEdgeInsets(top: 12, left: 12, bottom: 12, right: 12)
        textView.attributedText = highlight(code, language: language)
        return textView
    }
    
    // MARK: - Tokenization (Fast regex-based)
    
    // Pre-compiled regex patterns for speed
    private static let stringPattern = try! NSRegularExpression(pattern: #"\"[^\"\\]*(?:\\.[^\"\\]*)*\"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`]*`"#, options: [])
    private static let commentPattern = try! NSRegularExpression(pattern: #"//[^\n]*|/\*[\s\S]*?\*/|#[^\n]*"#, options: [])
    private static let numberPattern = try! NSRegularExpression(pattern: #"\b\d+\.?\d*\b"#, options: [])
    private static let wordPattern = try! NSRegularExpression(pattern: #"\b[a-zA-Z_$][a-zA-Z0-9_$]*\b"#, options: [])
    
    private func highlightTokens(
        in attrString: NSMutableAttributedString,
        code: String,
        keywords: Set<String>,
        types: Set<String>,
        scheme: ColorScheme
    ) {
        let range = NSRange(location: 0, length: code.utf16.count)
        
        // Track which ranges are already colored (comments/strings take precedence)
        var coloredRanges = [NSRange]()
        
        // 1. Comments first (highest precedence)
        let comments = Self.commentPattern.matches(in: code, options: [], range: range)
        for match in comments {
            attrString.addAttribute(.foregroundColor, value: scheme.comment, range: match.range)
            coloredRanges.append(match.range)
        }
        
        // 2. Strings
        let strings = Self.stringPattern.matches(in: code, options: [], range: range)
        for match in strings {
            if !coloredRanges.contains(where: { NSIntersectionRange($0, match.range).length > 0 }) {
                attrString.addAttribute(.foregroundColor, value: scheme.string, range: match.range)
                coloredRanges.append(match.range)
            }
        }
        
        // 3. Numbers
        let numbers = Self.numberPattern.matches(in: code, options: [], range: range)
        for match in numbers {
            if !coloredRanges.contains(where: { NSIntersectionRange($0, match.range).length > 0 }) {
                attrString.addAttribute(.foregroundColor, value: scheme.number, range: match.range)
            }
        }
        
        // 4. Keywords and identifiers
        let codeNS = code as NSString
        let words = Self.wordPattern.matches(in: code, options: [], range: range)
        for match in words {
            if coloredRanges.contains(where: { NSIntersectionRange($0, match.range).length > 0 }) {
                continue
            }
            
            let word = codeNS.substring(with: match.range)
            
            if keywords.contains(word) {
                attrString.addAttribute(.foregroundColor, value: scheme.keyword, range: match.range)
            } else if types.contains(word) || (word.first?.isUppercase == true && word.count > 1) {
                attrString.addAttribute(.foregroundColor, value: scheme.type, range: match.range)
            } else {
                // Check if followed by ( for function
                let afterWord = match.range.location + match.range.length
                if afterWord < code.utf16.count {
                    var idx = afterWord
                    while idx < code.utf16.count {
                        let c = codeNS.character(at: idx)
                        if c == 32 || c == 9 { // space or tab
                            idx += 1
                            continue
                        }
                        if c == 40 { // (
                            attrString.addAttribute(.foregroundColor, value: scheme.function, range: match.range)
                        }
                        break
                    }
                }
            }
        }
    }
}
