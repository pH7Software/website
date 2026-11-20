---
title: "pH7CMS 1.2.3 Released!"
description: "pH7CMS 1.2.3 has just been released. This is a maintenance version with minor fixes and improvements. The version fixed some errors made by some change in the 1.2 branch.…"
slug: "ph7cms-1-2-3-released"
publishedAt: "2015-09-08T08:15:16Z"
sourceType: "post"
sourceUrl: "https://ph7builder.com/ph7cms-1-2-3-released/"
categories: ["Release archive", "New version"]
tags: ["dating builder", "geo", "geoip", "geolocalization", "geolocation", "release", "version"]
historical: true
featured: false
draft: false
---
pH7CMS 1.2.3 has just been released. This is a maintenance version with minor fixes and improvements. The version fixed some errors made by some change in the 1.2 branch. There is also an exciting API integration if you want to integrate the CMS easily with an external software/site or mobile app (such iOS &amp; Android). A HTTP class to communicate with pH7CMS data has also been created and can be find <a href="https://github.com/pH7Software/pH7CMS-HTTP-REST-Push-Data" rel="noopener noreferrer">here</a>.

Finally, GeoIp has been upgrade to the version 2 and the database has been update as well. This change will be also very useful in the next major version (pH7CMS 1.3), as this version will integrate the distance search criteria and local profile results.

Please also keep in mind that you can upgrade the GeoIp version (by simply replace the '.mmdb' file by the one you bought in /_protected/framework/Geo/Ip/) by buying the Pro version (and getting around 95% of accurate results) and removing the Maxmind copyright link in the layout footer of your site.

To update your site to this new version, as the pH7CMS's database doesn't have any change, you just need to overwrite the new files to your current installation in order to update your site. Please make a backup of your site before and adding up your modification after.

Also, in order to make the update clean, please remove the following files:

<i>_protected/framework/Api/Api.class.php</i>
<i>_protected/framework/Geo/Ip/GeoLiteCity.dat</i>
<i>_protected/framework/Geo/Ip/geoip.inc.php</i>
<i>_protected/framework/Geo/Ip/geoipcity.inc.php</i>
<i>_protected/framework/Geo/Ip/geoipregionvars.php</i>
<i>static/js/cookie_consent/bar.js</i>
<i>static/js/cookie_consent/library.js</i>

Hope you'll like it! ;)
