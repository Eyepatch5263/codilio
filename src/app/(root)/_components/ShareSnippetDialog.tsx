"use client"
import { useCodeEditorStore } from '@/store/useCodeEditorStore'
import { useMutation } from 'convex/react'
import React, { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

const ShareSnippetDialog = ({ onClose }: { onClose: () => void }) => {
    const [title, setTitle] = useState("")
    const [isSharing, setIsSharing] = useState(false)
    const { language, getCode } = useCodeEditorStore()
    const createSnippet = useMutation(api.snippets.createSnippet)

    const handleShareSnippet = async(e:React.FormEvent) => {
        e.preventDefault()

        setIsSharing(true)
        try {
            const code=getCode()
            await createSnippet({title,code,language})
            setTitle("")
            toast.success("Snippet shared successfully")
        } catch (error) {
            console.log("Error creating snippet: " + error)
            toast.error("Error sharing snippet")
        }
        finally{
            setIsSharing(false)
            onClose()
        }

    }
    return (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50">
            <div className="bg-slate-900/20 border backdrop-blur-xl border-gray-600 rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Share Snippet</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleShareSnippet}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter snippet title"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-400 hover:text-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSharing}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
               disabled:opacity-50"
                        >
                            {isSharing ? "Sharing..." : "Share"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}

export default ShareSnippetDialog
