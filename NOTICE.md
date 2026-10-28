# Notices

## The offline language model

NIE's offline assistant runs **Qwen2.5-3B-Instruct** (quantised to Q4_K_M, in GGUF format) through the llama.cpp server.

- The model is made by the Qwen team at **Alibaba Cloud** and is distributed under the **Qwen Research License Agreement**.
  That licence allows research and non-commercial use and permits redistribution under its terms; **commercial use needs a
  separate licence from Alibaba Cloud.** Read the licence text on the model's official page before you use NIE for anything
  commercial or give it to other people.
- NIE does **not** include the model in its source code, and the small "click and run" downloads do not contain it: the app
  downloads it from the model's official page the first time it runs, so you receive it from its source with its licence.
- The large offline installer that the `windows-package` workflow builds as a workflow artifact *does* contain the model file.
  Treat that file as a private convenience copy; do not publish it unless the licence terms allow it for your use.
- If NIE is to be shared or sold, replace the model with one whose licence fits (for example a model under the Apache-2.0 or MIT
  licence). The model is one entry in `apps/desktop/src/runtime.js` (`DEFAULT_MODEL`, `MODEL_CATALOG`).

## The offline encyclopedia (Wikipedia text)

The optional offline encyclopedia is made of the opening paragraphs of Wikipedia articles. Wikipedia's text is available under the **Creative Commons Attribution-ShareAlike 4.0 licence** (https://creativecommons.org/licenses/by-sa/4.0/). NIE names and links the article in every reply that uses it; each article's authors are listed in its page history on Wikipedia. The pack is shortened (cut at a sentence end), never reworded, and it carries the licence and attribution in its header. The pack is not part of NIE's source code or installer; it is built by `scripts/build-encyclopedia.mjs` and downloaded by the writer. If you publish a pack, publish it under CC BY-SA 4.0 (see `docs/ENCYCLOPEDIA.md`).

## llama.cpp

The offline runtime is [llama.cpp](https://github.com/ggml-org/llama.cpp) (MIT licence), downloaded as a prebuilt release at build time.

## Microsoft Visual C++ runtime

`vcruntime140.dll`, `vcruntime140_1.dll` and `msvcp140.dll` are copied next to `llama-server.exe` so it starts on PCs that do not
have the Visual C++ redistributable installed.
