# proc-sampler.ps1 — emit one compact JSON line per tick describing every
# node.exe on the box. Used by scripts/probe-build-memory.mjs.
#
# ONE long-lived PowerShell process for the whole run, not one per sample.
# probe-dev-heap-cap.mjs shells `wmic` per-PID; at 250 ms across ~16 build
# workers that is ~64 process spawns/second, which perturbs the very thing
# being measured. A single Get-CimInstance call per tick costs ~10-30 ms.
#
# Two numbers per process, deliberately:
#   WorkingSetSize — resident bytes. Windows working set is trimmable, so this
#                    can UNDER-report versus a Linux cgroup.
#   PageFileUsage  — private commit, in KB. Closer to what a Linux container
#                    OOM-kills on. Report both; trust neither as an absolute
#                    prediction of Vercel.
param([int]$IntervalMs = 250)

$ErrorActionPreference = 'Stop'
while ($true) {
  try {
    $procs = @(Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction Stop |
      Select-Object ProcessId, ParentProcessId, WorkingSetSize, PageFileUsage)
    $payload = [pscustomobject]@{
      t = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
      p = $procs
    }
    # -Compress keeps it to one line so the Node side can split on newline.
    Write-Output ($payload | ConvertTo-Json -Compress -Depth 4)
  } catch {
    Write-Output ('{"t":' + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds() + ',"err":"' + ($_.Exception.Message -replace '"', "'") + '"}')
  }
  Start-Sleep -Milliseconds $IntervalMs
}
