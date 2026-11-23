---
title: "License Issue"
description: "These days, for Premium installations of pH7CMS, you may have encountered some issue saying that your license key was invalided or some PHP warning in the header of your…"
slug: "license-issue"
publishedAt: "2015-09-27T21:23:27Z"
sourceType: "post"
sourceUrl: "https://ph7builder.com/license-issue/"
categories: ["Problem"]
tags: ["issue", "license", "license key", "problem"]
historical: true
featured: false
draft: false
---
These days, for Premium installations of pH7CMS, you may have encountered some issue saying that your license key was invalided or some PHP warning in the header of your pages. We are again really sorry about that and we are really happy to announce that now the issue is solved for sure.
If you currently have this issue, the way to solve the problem is to remove the following files:
<code>
/YOUR-PROTECTED-FOLDER/framework/Core/Kernel.class.php
/YOUR-PROTECTED-FOLDER/framework/Core/License.class.php
</code>
and refresh the page through your Web browser, then check (or re-enter) the license through your admin panel and it should be solved. For current guidance, review the <a href="https://github.com/pH7Software/pH7-Social-Dating-CMS/tree/20.x/docs" rel="noopener noreferrer">pH7Builder documentation</a>.

Again, if you still have some other issues, please feel free to contact the support in your member area and the team will be more than happy to assist you!

Have a great week!

See you soon for some next really exciting news! :)
