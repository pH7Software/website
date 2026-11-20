---
title: "We are now running everything under HTTPS"
description: "Hi All! Just a quick update to let you know that now all our websites are running under HTTPS (the secure encrypted web protocol). Troubleshooting If you are using pH7CMS…"
slug: "servers-under-https"
publishedAt: "2017-02-24T00:21:13Z"
sourceType: "post"
sourceUrl: "https://ph7builder.com/servers-under-https/"
categories: ["News", "Problem"]
tags: ["https", "license key", "problem", "secure", "ssl"]
historical: true
featured: false
draft: false
---
Hi All!

Just a quick update to let you know that now all our websites are running under HTTPS (the secure encrypted web protocol).

<h3>Troubleshooting</h3>

If you are using pH7CMS Pro from 1.4.2 to version 5.0, your website may have been downgrade to pH7CMS Classic version since the http code response isn't the same anymore.


<h4>Here are the steps to fix the problem:</h4>

<ol>
<li>Remove "<em>/_protected/framework/Core/License.class.php</em>" file</li>
<li>Go to <a href="/get-started/">the current pH7Builder support options</a></li>
<li>Reissue your license key (Services -&gt; My Services -&gt; Your Product Name -&gt; "Reissue" button)</li>
<li>Copy/paste your license key</li>
<li>Go to your website, admin panel -&gt; Settings -&gt; License -&gt; and paste your license key, then submit it</li>
<li>Now, it should work again! :)</li>
</ol>

<h4>Some other useful links:</h4>
<ul>
<li><a href="https://github.com/pH7Software/pH7-Social-Dating-CMS/tree/18.x/docs" rel="noopener noreferrer">Read the current pH7Builder documentation</a></li>
</ul>

Hope this helps!

Finally, if the problem still occurs, please review the <a href="/get-started/">current pH7Builder support options</a>.
