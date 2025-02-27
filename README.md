# YouTrack Diagrams Editor

Once installed into [JetBrains YouTrack](https://www.jetbrains.com/youtrack/), this App provides a Drawio-Editor for editing diagrams.

---
<div style="display: flex;">
  <h3>t<img src="https://twenty20.de/favicon.ico" alt="twenty20" width="24" style="vertical-align: -4px;"/>nty20 | YouTrack Apps and Extensions</h3>
</div>

We specialize in developing custom YouTrack apps and extensions tailored specifically to your needs.

With our expertise and close collaboration with **JetBrains**, we ensure seamless integration and functionality.

👉 Visit our **[Website](https://twenty20.de/)** for more information and to explore our services.

👉 Looking for other extensions?  
Check out our offerings in the **[JetBrains Marketplace](https://plugins.jetbrains.com/vendor/twenty20)**.

---


### Installation

1. `npm install`
2. `npm build`

#### Manual way

1. Archive "build" folder into a single ZIP file (`npm run pack`)
2. Go to `%YOUTRACK_URL%/admin/apps` (you need admin permissions to do so)
3. Import app from ZIP archive
4. Attach app to desired projects on `%YOUTRACK_URL%/admin/editProject/%PROJECT_ID%?tab=apps` page
5. Open an issue in desired project and check App widgets appear

#### Endpoint way (useful for developing)

1. `npm run upload -- --host %YOUTRACK_URL% --token perm:cm9vdA==.NT...`, where token is a permanent
   token, granted on `%YOUTRACK_URL%/youtrack/users/me?tab=account-security`
2. Attach to desired projects, as described above
3. Apply changes to sources and repeat p.2 
