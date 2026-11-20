---
title: "pH7CMS: The Monster is ready!!"
description: "After months of hard work, pH7CMS 1.2 stable version is finally ready! (the release date is for this Thursday) In order to avoid confusion with the 1.2 beta which was…"
slug: "ph7cms-the-monster-is-ready"
publishedAt: "2015-06-24T08:04:49Z"
sourceType: "post"
sourceUrl: "https://ph7builder.com/ph7cms-the-monster-is-ready/"
categories: ["New feature", "New version"]
tags: ["bitcoin", "design", "geo", "localization", "location", "responsive", "stable", "stripe", "video background"]
historical: true
featured: false
draft: false
---
<p>After months of hard work, pH7CMS 1.2 stable version is finally ready! (the release date is for this Thursday)</p>
<p>In order to avoid confusion with the 1.2 beta which was already a good and stable version and has been released for now over three months, I deceived to release this under the version '1.2.1' and moreover this stable version has also a few new amazing features that pH7CMS 1.2.0 Beta just didn't.</p>
<h2>New faster and easier installer</h2>
<p>This version has a new and much easier installer than the other one and containing more practical explanation.</p>
<h2>Stripe &amp; Bitcoin integration</h2>
<p>As you may know, pH7CMS software always try to be the "first one" in everything, and again it is the first to have Stripe and Bitcoin gateways integrated.</p>
<p>So now, pH7CMS is able to accept PayPal, 2CheckOut, Stripe and BitCoin. </p>
<p>Again, please note that these features (like much more others) are not available in the free version, but only in the <a href="/order/">premium one</a>.</p>
<h2>Possibility to disable the security CSRF tokens in forms</h2>
<p>For some users it was annoying to get the "The security token does not exist or the security time of the token has expired. Please try again!" message by staying too long on the form or by using a proxy Internet connection.</p>
<p>It is now possible to disable that by going to the admin panel -&gt; Settings -&gt; Security -&gt; Various -&gt; Security Token</p>
<h2>HTML Background Video on Splash Page</h2>
<p>pH7CMS 1.2.1 has now a new option (available through the Admin Panel -&gt; Settings -&gt; General) and activated by default.</p>
<p>This feature will definitely make your site fantastic!</p>
<h2>100% Responsive</h2>
<p>pH7CMS is now 100% responsive and so can be used on any modern devices.</p>
<h2>GEOLocalization Updated</h2>
<p>As you may know, pH7CMS is based on the user's GeoLocalization. The "UserDesignCoreModel" PHP class has just been updated in order to make easier the integration of avatars in relation to the proximity of the location of other users</p>
<p>For example, now you can easily put the following code in the ".tpl" template file:</p>
<p><code>{{ (new UserDesignCoreModel)-&gt;geoProfiles() }}</code></p>
<p>Be careful, if there is any user registered with your location, the return will be null and nothing will be showed.</p>
<h2>Improvement to add new CSS &amp; JS variables</h2>
<p>As you may know, pH7CMS allows to create the personalized and unique variable in CSS and JS files.</p>
<p>pH7CMS translates any CSS and JS files, transforms the variables to its values, then compiled it and store the modified file to the cache one until the next modification in the ".css"" or ".js"" file.</p>
<p>Now, you can create your own CSS &amp; JavaScript template's variables easier than you always thought.</p>
<p>Thanks the variable.inc.php file located in ~/_protected/framework/Layout/Gzip/, you you will be able to add your own variable in the array, then use the following syntax in any CSS or JS files.</p>
<p><code>[$my_own_var]</code></p>
<p>Hope you will enjoy that "code feature"(even that it is not necessary for you in most cases ...).</p>
<h2>Explanation -&gt; Rumor, why pH7CMS is so slow...?</h2>
<p>pH7CMS is in fact not slow at all, but as it is so different from classic CMS like Wordpress, Drupal, Joomla, people think that it should be the same.</p>
<p>However, it shouldn't be test on a local server for the speed (it will always be slow on a local host or Web host not optimized for it). It is like to run Facebook or Badoo on your laptop local server (even with no visitors). The website will be extremely slow because it is not optimized for that kind of server.</p>
<p>So no, pH7CMS is really speed if your server is optimized and has a modern hardware. It uses 97% object code and so it is more greedy if your hardware server, HTTP Server or PHP version is not good enough for it, old or doesn't have the latest version.</p>
<p>It's like watching an HD movie on a standard TV. This does absolutely worthless, or even like using iOS8 on iPhone4S (or something like that).</p>
<p>Whatever, it can always be optimized, for example if you are sure that your server will always be connected to the Internet (because it uses some remote data, like some Google Api libraries), you edit the following file:</p>
<p><code>_protected/app/includes/helpers/misc.php</code></p>
<p>In the end, edit the "is_internet()" function.</p>
<p>Change</p>
<p><code>"return (bool) @fsockopen($sCheckHost, 80, $iErrno, $sErrStr, 5);"</code></p>
<p>by</p>
<p><code>"return true;"</code></p>
<p>then save it. Only with that, your site can be speeder.</p>
<h2>Your Feedback is Important</h2>
<p>As usual, your feedback about the software and services is very important, so please do not hesitate!</p>
