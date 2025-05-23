import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import Editor from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useParams } from "react-router-dom";
import { setProjectData } from "../redux/userStore";
import { debounce } from "lodash";

function EditorPage() {
  const { projectData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const { id, version } = useParams();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [isError, setIsError] = useState(false); // 👈 New state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/selectproject/${id}`,
          { withCredentials: true }
        );

        if (response.status === 200) {
          const { project } = response.data;
          dispatch(setProjectData(project));
          setCode(project.code?.trim() || "");
          setLanguage(project.projLanguage || "javascript");
        } else {
          console.error("❌ Backend error:", response.data);
        }
      } catch (error) {
        console.error("❌ Fetch error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, dispatch]);

  const saveProject = async (newCode) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/saveproject`,
        { projectId: id, code: newCode },
        { withCredentials: true }
      );

      if (response.status === 200 && response.data.success) {
        dispatch(
          setProjectData(response.data.project || { ...projectData, code: newCode })
        );
      } else {
        console.error("❌ Save failed:", response.data);
      }
    } catch (err) {
      console.error("❌ Save error:", err.message);
    }
  };

  const debouncedSave = useCallback(debounce(saveProject, 500), [id, projectData]);

  useEffect(() => {
    return () => debouncedSave.flush();
  }, [debouncedSave]);

  const updateSuggestions = (monaco, codeStr, lang) => {
    if (!monaco || !lang) return;

    const matches = Array.from(codeStr.matchAll(/\b([a-zA-Z_]\w*)\b/g));
    const uniqueVars = [...new Set(matches.map((match) => match[1]))].filter(
      (name) => name.length > 2
    );

    if (window.completionProvider) window.completionProvider.dispose();

    window.completionProvider = monaco.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems: () => ({
        suggestions: uniqueVars.map((name) => ({
          label: name,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: name,
          detail: "User-defined variable",
        })),
      }),
    });
  };

  const handleEditorChange = (newCode) => {
    if (newCode === undefined) return;
    setCode(newCode);

    if (newCode.trim() === "") {
      if (window.completionProvider) window.completionProvider.dispose();
      saveProject("");
      return;
    }

    debouncedSave(newCode);

    if (window.monaco) {
      updateSuggestions(window.monaco, newCode, language);
    }
  };

  const getFileExtension = (lang) => {
    switch (lang) {
      case "python": return ".py";
      case "java": return ".java";
      case "javascript": return ".js";
      case "c": return ".c";
      case "cpp": return ".cpp";
      case "bash": return ".sh";
      default: return ".txt";
    }
  };

  const runProject = async () => {
    setRunning(true);
    setOutput("Running code...");
    setIsError(false);

    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: projectData.projLanguage || language || "cpp",
          version: version || "*",
          files: [
            {
              name: (projectData.name || "Main") + getFileExtension(projectData.projLanguage || language),
              content: code,
            },
          ],
        }),
      });

      const result = await response.json();
      const stdout = result.run?.stdout?.trim() || "";
      const stderr = result.run?.stderr?.trim() || "";

      if (stderr) {
        const cleaned = stderr
          .split("\n")
          .map((line) => line.replace(/^(\/?[\w\-.\\/]+):?\d*:?(\d*):?\s*/, ""))
          .join("\n")
          .trim();
        setOutput(`Error:\n${cleaned}`);
        setIsError(true); // 👈 set to error
      } else {
        setOutput(stdout || "✅ No output.");
        setIsError(false);
      }
    } catch (error) {
      console.error("Run error:", error);
      setOutput("Execution failed. Check your code or console.");
      setIsError(true); // 👈 set to error
    } finally {
      setRunning(false);
    }
  };

  const clearCode = async () => {
    setCode("");
    setOutput("");
    setIsError(false);
    if (window.completionProvider) window.completionProvider.dispose();

    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/saveproject`,
        { projectId: id, code: "" },
        { withCredentials: true }
      );
      dispatch(setProjectData({ ...projectData, code: "" }));
    } catch (err) {
      console.error("❌ Clear error:", err.message);
    }
  };

  return (
    <>
      <Navbar />
      {loading ? (
        <div className="w-full h-[calc(100vh-90px)] mt-[90px] flex items-center justify-center bg-black text-white text-xl">
          Loading...
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-90px)] mt-[90px]">
          <div className="w-full lg:w-1/2 h-1/2 lg:h-full">
            <Editor
              value={code}
              onChange={handleEditorChange}
              beforeMount={(monaco) => {
                window.monaco = monaco;
                updateSuggestions(monaco, code, language);
              }}
              height="100%"
              width="100%"
              defaultLanguage={language}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                lineNumbers: "on",
                wordWrap: "on",
                scrollBeyondLastLine: false,
                renderWhitespace: "all",
                renderLineHighlight: "all",
                renderIndentGuides: true,
                folding: true,
                formatOnType: true,
                formatOnPaste: true,
                autoClosingBrackets: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: true,
                },
                parameterHints: { enabled: true },
                acceptSuggestionOnEnter: "on",
                snippetSuggestions: "inline",
                codeLens: true
              }}
            />
          </div>

          <div className="w-full lg:w-1/2 h-1/2 lg:h-full bg-[#27272a] p-4 overflow-auto flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-2xl text-white">Output</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={runProject}
                  disabled={running}
                  className={`px-4 py-1.5 text-sm sm:text-base text-white rounded transition-all ${
                    running
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {running ? "Running..." : "Run"}
                </button>
                <button
                  onClick={clearCode}
                  className="px-4 py-1.5 text-sm sm:text-base text-white bg-red-500 hover:bg-red-600 rounded"
                >
                  Clear Code
                </button>
              </div>
            </div>
            <pre className="text-sm whitespace-pre-wrap flex-grow">
              <span className={isError ? "text-red-400" : "text-white"}>
                {output}
              </span>
            </pre>
          </div>
        </div>
      )}
    </>
  );
}

export default EditorPage;
