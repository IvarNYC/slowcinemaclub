(()=>{var e={};e.id=608,e.ids=[608],e.modules={2518:e=>{"use strict";e.exports=require("mongodb")},846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3435:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>w,routeModule:()=>u,serverHooks:()=>m,workAsyncStorage:()=>p,workUnitAsyncStorage:()=>d});var i={};r.r(i),r.d(i,{GET:()=>c});var n=r(2706),s=r(8203),o=r(5994),a=r(1317);function l(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}async function c(){let e=await (0,a.X_)("scc","movies"),t=await e.find({}).toArray();return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
      <channel>
        <title>Slow Cinema Club</title>
        <description>Deep analysis of arthouse and experimental cinema</description>
        <link>https://slowcinemaclub.com</link>
        <atom:link href="https://slowcinemaclub.com/feed.xml" rel="self" type="application/rss+xml" />
        ${t.map(e=>`
          <item>
            <title>${e.title} Review (${e.year})</title>
            <link>https://slowcinemaclub.com/reviews/${l(e.title)}</link>
            <guid>https://slowcinemaclub.com/reviews/${l(e.title)}</guid>
            <description>${e.description}</description>
            <pubDate>${new Date(e.updatedAt||new Date).toUTCString()}</pubDate>
          </item>
        `).join("")}
      </channel>
    </rss>`,{headers:{"Content-Type":"application/xml","Cache-Control":"public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400"}})}let u=new n.AppRouteRouteModule({definition:{kind:s.RouteKind.APP_ROUTE,page:"/feed.xml/route",pathname:"/feed.xml",filename:"route",bundlePath:"app/feed.xml/route"},resolvedPagePath:"/Users/ivarnycolaas/Documents/webdev/slowcinemaclub/app/feed.xml/route.ts",nextConfigOutput:"standalone",userland:i}),{workAsyncStorage:p,workUnitAsyncStorage:d,serverHooks:m}=u;function w(){return(0,o.patchFetch)({workAsyncStorage:p,workUnitAsyncStorage:d})}},6487:()=>{},8335:()=>{},1317:(e,t,r)=>{"use strict";let i;r.d(t,{X_:()=>a});var n=r(2518);if(!process.env.MONGODB_URI)throw Error('Invalid/Missing environment variable: "MONGODB_URI"');let s=process.env.MONGODB_URI;async function o(e){return(await i).db(e)}async function a(e,t){return(await o(e)).collection(t)}i=new n.MongoClient(s,{maxPoolSize:10,minPoolSize:5,maxIdleTimeMS:6e4,connectTimeoutMS:1e4,socketTimeoutMS:45e3}).connect()},2706:(e,t,r)=>{"use strict";e.exports=r(4870)}};var t=require("../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[994],()=>r(3435));module.exports=i})();