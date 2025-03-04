export function JavaCompletionProvider(monaco) {
  monaco.languages.registerCompletionItemProvider("java", {
    provideCompletionItems: (model, position) => {
      const code = model.getValue()
      const word = model.getWordAtPosition(position)

      // Get arrays if needed for fore/fori suggestions
      const arrays = getDeclaredArrays(code)
      const lastArray = arrays.length > 0 ? arrays[arrays.length - 1] : null

      // Static suggestions array containing all snippets and keywords
      const staticSuggestions = [
        // Snippets
        {
          label: "sout",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "System.out.println(${1:});",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Print to console"
        },
        {
          label: "psvm",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public static void main(String[] args) {\n\t${1}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Main method"
        },
        {
          label: "class",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "class ${1:Name} {\n\t${2}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Class definition"
        },
        {
          label: "if",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "if (${1:condition}) {\n\t${2}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "If statement"
        },
        {
          label: "else",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "else {\n\t${1}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Else statement"
        },
        {
          label: "while",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "while (${1:condition}) {\n\t${2}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "While loop"
        },
        {
          label: "doWhile",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "do {\n\t${1}\n} while (${2:condition});",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Do-while loop"
        },
        {
          label: "switch",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "switch (${1:variable}) {\n\tcase ${2:case1}:\n\t\t${3}\n\t\tbreak;\n\tdefault:\n\t\t${4}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Switch statement"
        },
        {
          label: "tryCatch",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "try {\n\t${1}\n} catch (${2:Exception} ${3:e}) {\n\t${4}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Try-catch block"
        },
        {
          label: "tryCatchFinally",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "try {\n\t${1}\n} catch (${2:Exception} ${3:e}) {\n\t${4}\n} finally {\n\t${5}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Try-catch-finally block"
        },
        {
          label: "method",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "public ${1:void} ${2:methodName}(${3:params}) {\n\t${4}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Method definition"
        },
        // Keywords
        { label: "abstract", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "abstract ", documentation: "Abstract keyword" },
        { label: "continue", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "continue;", documentation: "Continue statement" },
        { label: "for", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "for ", documentation: "For loop" },
        { label: "new", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "new ", documentation: "New keyword" },
        { label: "switch", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "switch ", documentation: "Switch statement" },
        { label: "default", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "default:", documentation: "Default case in a switch statement" },
        { label: "package", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "package ", documentation: "Package statement" },
        { label: "synchronized", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "synchronized ", documentation: "Synchronized block" },
        { label: "boolean", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "boolean ", documentation: "Boolean data type" },
        { label: "do", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "do ", documentation: "Do-while loop" },
        { label: "if", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "if ", documentation: "If statement" },
        { label: "private", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "private ", documentation: "Private access modifier" },
        { label: "this", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "this", documentation: "This keyword" },
        { label: "break", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "break;", documentation: "Break statement" },
        { label: "double", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "double ", documentation: "Double data type" },
        { label: "implements", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "implements ", documentation: "Implements keyword" },
        { label: "protected", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "protected ", documentation: "Protected access modifier" },
        { label: "throw", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "throw ", documentation: "Throw exception" },
        { label: "byte", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "byte ", documentation: "Byte data type" },
        { label: "else", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "else ", documentation: "Else statement" },
        { label: "import", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "import ", documentation: "Import statement" },
        { label: "public", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "public ", documentation: "Public access modifier" },
        { label: "throws", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "throws ", documentation: "Throws clause in method declaration" },
        { label: "case", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "case ", documentation: "Case statement in switch" },
        { label: "instanceof", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "instanceof ", documentation: "Instanceof keyword" },
        { label: "return", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "return ", documentation: "Return statement" },
        { label: "transient", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "transient ", documentation: "Transient keyword" },
        { label: "catch", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "catch ", documentation: "Catch block" },
        { label: "extends", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "extends ", documentation: "Extends keyword" },
        { label: "int", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "int ", documentation: "Integer data type" },
        { label: "short", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "short ", documentation: "Short data type" },
        { label: "try", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "try ", documentation: "Try block" },
        { label: "char", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "char ", documentation: "Character data type" },
        { label: "final", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "final ", documentation: "Final keyword" },
        { label: "interface", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "interface ", documentation: "Interface declaration" },
        { label: "static", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "static ", documentation: "Static keyword" },
        { label: "void", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "void ", documentation: "Void return type" },
        { label: "class", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "class ", documentation: "Class declaration" },
        { label: "finally", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "finally ", documentation: "Finally block" },
        { label: "long", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "long ", documentation: "Long data type" },
        { label: "volatile", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "volatile ", documentation: "Volatile keyword" },
        { label: "float", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "float ", documentation: "Float data type" },
        { label: "native", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "native ", documentation: "Native keyword" },
        { label: "super", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "super ", documentation: "Super keyword" },
        { label: "while", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "while ", documentation: "While loop" }
      ]

      // Handle special cases for fore and fori
      if (lastArray != null) {
        const foreSuggestion = {
          label: "fore",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `for (${lastArray.type} ${lastArray.type.charAt(0)} : ${lastArray.name}) {\n\t$1\n}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: `Iterate over ${lastArray.name}`
        }

        const foriSuggestion = {
          label: "fori",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `for (int i = 0; i < ${lastArray.name}.length; i++) {\n\t$1\n}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: `Iterate over ${lastArray.name} with index`
        }

        return { suggestions: [foreSuggestion, foriSuggestion, ...staticSuggestions] }

      } else {
        const foreSuggestion = {
          label: "fore",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "for (${1:Type} ${2:element} : ${3:collection}) {\n\t${4}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "For-each loop"
        }

        const foriSuggestion = {
          label: "fori",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: "for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t${3}\n}",
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "For loop"
        }

        return { suggestions: [foreSuggestion, foriSuggestion, ...staticSuggestions] }

      }
    }
  })
}

// Helper function to find declared arrays in the code
function getDeclaredArrays(code) {
  const regex = /\b(Object|boolean|char|byte|int|short|long|float|double)\[\]\s+(\w+)\s*=\s*new\s+\1\[\d+\]/g
  const arrays = []
  let match

  while ((match = regex.exec(code)) !== null) {
    arrays.push({ name: match[2], type: match[1] })
  }

  return arrays
}