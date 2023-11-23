import React, { useState, useRef } from "react";
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  getDefaultKeyBinding,
} from "draft-js";
import "draft-js/dist/Draft.css";

// Define custom styles
const styleMap = {
  RED_TEXT: {
    color: "red",
  },
  UNDERLINE_TEXT: {
    textDecoration: "underline",
  },
};

const MyDraftEditor = () => {
  const [editorState, setEditorState] = useState(() => {
    const storedContent = window.localStorage.getItem("draftEditorContent");
    if (storedContent) {
      return EditorState.createWithContent(
        convertFromRaw(JSON.parse(storedContent))
      );
    }
    return EditorState.createEmpty();
  });

  const editor = useRef(null);

  const handleBeforeInput = (chars, editorState) => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const currentBlock = currentContent.getBlockForKey(selection.getStartKey());
    const start = selection.getStartOffset();
    const end = selection.getEndOffset();
    const text = currentBlock.getText();

    // Only handle the case where a space is added at the start of the line
    if (chars !== " " || start !== end || start > 3) {
      return "not-handled";
    }

    let newState = null;
    let blockType = null;
    let inlineStyle = null;
    let charToRemove = 0;

    // Identify the markdown-like syntax and determine the new state
    if (text.startsWith("***") && start === 3) {
      inlineStyle = "UNDERLINE_TEXT";
      charToRemove = 3;
    } else if (text.startsWith("**") && start === 2) {
      inlineStyle = "RED_TEXT";
      charToRemove = 2;
    } else if (text.startsWith("*") && start === 1) {
      inlineStyle = "BOLD";
      charToRemove = 1;
    } else if (text.startsWith("#") && start === 1) {
      blockType = "header-one";
      charToRemove = 1;
    }

    if (inlineStyle || blockType) {
      let newContentState = Modifier.removeRange(
        currentContent,
        selection.merge({
          anchorOffset: 0,
          focusOffset: charToRemove,
        }),
        "backward"
      );

      if (blockType) {
        newState = EditorState.push(
          editorState,
          newContentState,
          "change-block-type"
        );
        newState = RichUtils.toggleBlockType(newState, blockType);
      } else if (inlineStyle) {
        newState = EditorState.push(
          editorState,
          newContentState,
          "change-inline-style"
        );
        newState = RichUtils.toggleInlineStyle(newState, inlineStyle);
      }

      if (newState) {
        setEditorState(newState);
        return "handled";
      }
    }

    return "not-handled";
  };

  const saveContent = () => {
    const content = editorState.getCurrentContent();
    window.localStorage.setItem(
      "draftEditorContent",
      JSON.stringify(convertToRaw(content))
    );
  };

  const styleMap = {
    RED_TEXT: {
      color: "red",
    },
    UNDERLINE_TEXT: {
      textDecoration: "underline",
    },
  };

  return (
    <div style={{ padding: "20px", width: "85%", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ width: "50%", textAlign: "right" }}>Abdul</h1>
        <button
          onClick={saveContent}
          style={{ float: "right", padding: "10px 30px", border: "2px solid" }}
        >
          Save
        </button>
      </div>
      <div className="editor-container" onClick={() => editor.current.focus()}>
        <Editor
          placeholder="Please Enter Input"
          ref={editor}
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={handleBeforeInput}
          customStyleMap={styleMap}
          keyBindingFn={getDefaultKeyBinding}
        />
      </div>
    </div>
  );
};

export default MyDraftEditor;
