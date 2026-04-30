## GitHub Copilot Chat

- Extension: 0.45.1 (prod)
- VS Code: 1.117.0 (10c8e557c8b9f9ed0a87f61f1c9a44bde731c409)
- OS: win32 10.0.26200 x64
- GitHub Account: sana123-ahm

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: Error (2 ms): getaddrinfo ENOTFOUND api.github.com
- DNS ipv6 Lookup: Error (1 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): Error (4 ms): Error: net::ERR_NAME_NOT_RESOLVED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (24 ms): Error: getaddrinfo ENOTFOUND api.github.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (47 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14902:13
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at t._fetch (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5307:5229)
    at t.fetch (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5307:4541)
    at u (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5339:186)
    at Eg._executeContributedCommand (file:///c:/Users/pc/AppData/Local/Programs/Microsoft%20VS%20Code/10c8e557c8/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:501:48675)
  Error: getaddrinfo ENOTFOUND api.github.com
      at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: Error (1 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- DNS ipv6 Lookup: Error (1 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (26 ms)
- Electron fetch (configured): Error (2 ms): Error: net::ERR_NAME_NOT_RESOLVED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (35 ms): Error: getaddrinfo ENOTFOUND api.githubcopilot.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (23 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14902:13
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at t._fetch (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5307:5229)
    at t.fetch (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5307:4541)
    at u (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5339:186)
    at Eg._executeContributedCommand (file:///c:/Users/pc/AppData/Local/Programs/Microsoft%20VS%20Code/10c8e557c8/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:501:48675)
  Error: getaddrinfo ENOTFOUND api.githubcopilot.com
      at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: Error (1 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- DNS ipv6 Lookup: Error (1 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (4 ms)
- Electron fetch (configured): Error (2 ms): Error: net::ERR_NAME_NOT_RESOLVED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (18 ms): Error: getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
- Node.js fetch: Error (21 ms): TypeError: fetch failed
    at node:internal/deps/undici/undici:14902:13
    at processTicksAndRejections (node:internal/process/task_queues:103:5)
    at t._fetch (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5307:5229)
    at t.fetch (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5307:4541)
    at u (c:\Users\pc\.vscode\extensions\github.copilot-chat-0.45.1\dist\extension.js:5339:186)
    at Eg._executeContributedCommand (file:///c:/Users/pc/AppData/Local/Programs/Microsoft%20VS%20Code/10c8e557c8/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:501:48675)
  Error: getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
      at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Connecting to https://mobile.events.data.microsoft.com: Error (2 ms): Error: net::ERR_NAME_NOT_RESOLVED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://dc.services.visualstudio.com: Error (2 ms): Error: net::ERR_NAME_NOT_RESOLVED
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
    at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (15 ms): Error: getaddrinfo ENOTFOUND copilot-telemetry.githubusercontent.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (12 ms): Error: getaddrinfo ENOTFOUND copilot-telemetry.githubusercontent.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)
Connecting to https://default.exp-tas.com: Error (16 ms): Error: getaddrinfo ENOTFOUND default.exp-tas.com
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:122:26)

Number of system certificates: 97

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).