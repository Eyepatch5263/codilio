import React from 'react'
import CopyButton from './CopyButton';
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";


interface CodeBlockProps {
    code: string
    language: string
}

const CodeBlock = ({ code, language }: CodeBlockProps) => {
    const trimmedCode = code
        .split("\n") // split into lines
        .map((line) => line.trimEnd()) // remove trailing spaces from each line
        .join("\n");
    return (
        <div className="my-4 bg-[#0a0a0f] rounded-lg overflow-hidden border border-[#ffffff0a]">
            {/* header bar showing language and copy button */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#ffffff08]">
                {/* language indicator with icon */}
                <div className="flex items-center gap-2">
                    <img src={`/${language}.png`} alt={language} className="size-4 object-contain" />
                    <span className="text-sm text-gray-400">{language || "plaintext"}</span>
                </div>
                {/* button to copy code to clipboard */}
                <CopyButton code={trimmedCode} />
            </div>

            {/* code block with syntax highlighting */}
            <div className="relative">
                <SyntaxHighlighter
                    language={language || "plaintext"}
                    style={atomOneDark} // dark theme for the code
                    customStyle={{
                        padding: "1rem",
                        background: "transparent",
                        margin: 0,
                    }}
                    showLineNumbers={true}
                    wrapLines={true} // wrap long lines
                >
                    {trimmedCode}
                </SyntaxHighlighter>
            </div>
        </div>
    )
}

export default CodeBlock