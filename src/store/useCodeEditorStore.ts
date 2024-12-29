import { create } from "zustand"
import { LANGUAGE_CONFIG } from "../app/(root)/_constants/page"
import { Monaco } from "@monaco-editor/react"
import { CodeEditorState } from "../types"

const getInitialState = () => {
    //if we are on the server side
    const initalState = {
        language: "javascript",
        theme: "vs-dark",
        fontSize: 16,

    }
    //if we are on the client side the fetch the saved values from local storage
    if (typeof window !== "undefined") {
        const savedLanguage = localStorage.getItem("editor-language") || "javascript"
        const savedTheme = localStorage.getItem("editor-theme") || "vs-dark"
        const savedFontSize = localStorage.getItem("editor-font-size") || 16
        return {
            language: savedLanguage,
            theme: savedTheme,
            fontSize: Number(savedFontSize),
        }
    }
    return initalState


}

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const initalState = getInitialState()
    return {
        ...initalState,
        output: "",
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        getCode: () => get().editor?.getValue() || ""
        ,
        setEditor: (editor: Monaco) => {
            const savedCode = localStorage.getItem(`editor-code-${get().language}}`)
            if (savedCode) {
                editor.setValue(savedCode)
            }
            set({ editor })
        },
        setTheme: (theme: string) => {
            localStorage.setItem("editor-theme", theme)
            set({ theme })
        },
        setFontSize: (fontSize: number) => {
            localStorage.setItem("editor-font-size", fontSize.toString())
            set({ fontSize })
        },
        setLanguage: (language: string) => {
            const currentCode = get().editor?.getValue()
            if (currentCode) {
                localStorage.setItem(`editor-code-${get().language}`, currentCode)
            }
            localStorage.setItem("editor-language", language)
            set({
                language,
                output: "",
                error: null,
            })
        },
        runCode: async () => {
            const { language, getCode } = get()
            const code = getCode()
            if (!code) {
                set({ error: "Please enter a vailid code." })
                return
            }
            set({ isRunning: true, error: "null", output: "" })

            try {
                const runtime = LANGUAGE_CONFIG[language].pistonRuntime
                const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        language: runtime.language,
                        files: [{ content: code }],
                        version: runtime.version
                    })
                })

                const data = await response.json()
                console.log("data from piston: ", data)

                //handle API_level errors
                if (data.message) {
                    set({ error: data.message, executionResult: { code, output: "", error: data.message } })
                    return
                }

                //handle compile errors for languages like c++,c

                if(data.compile && data.compile.code!==0){
                    const error=data.compile.stderr || data.compile.output
                    set({error,executionResult:{code,output:"",error}})
                    return
                }

                //handle runtime errors for languages like python,javascript,go
                if(data.run && data.run.code!==0){
                    const error=data.run.stderr || data.run.output
                    set({error,executionResult:{code,output:"",error}})
                    return
                }

                //if everything is fine or execution is successful
                const output = data.run.output
                set({ output:output.trim(),error:null, executionResult: { code, output:output.trim(), error: null } })



            } catch (error) {
                console.log("Error running code: " + error)
                set({ error: "Error running code: " + error, executionResult: { code, output: "", error: "Error running code: " + error } })

            }
            finally{
                set({isRunning:false})
            }


        }
    }
})

export const getExecutionResult=()=>useCodeEditorStore.getState().executionResult