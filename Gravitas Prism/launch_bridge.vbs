Set WshShell = CreateObject("WScript.Shell")
scriptDir = Replace(WScript.ScriptFullName, "launch_bridge.vbs", "")
cmdStr = "cmd.exe /c node """ & scriptDir & "apply_gravitas_prism.mjs"" --bridge >> """ & scriptDir & ".cache\bridge.log"" 2>&1"
WshShell.Run cmdStr, 0, False
