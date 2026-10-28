/* Hid in my heart. Runs after core.js. The Scripture text is fetched one file per book (data/text/),
   then startApp builds the UI. */
var HID_TEXT_BOOKS = ["1-corinthians","1-john","1-peter","1-thessalonians","1-timothy","2-corinthians","2-peter","2-timothy","acts","colossians","daniel","ephesians","exodus","galatians","hebrews","isaiah","james","jeremiah","john","joshua","lamentations","luke","mark","matthew","philippians","proverbs","psalm","revelation","romans","titus"];

function startApp(TEXT) {
  "use strict";

  var APP_VERSION = "v15 (28 Oct 2026)";
  var INSECURE = window.isSecureContext === false;
  var FILE_MSG = "You’ve opened this page as a file on your device. Phones only allow the microphone on a web address that starts with https://. Open your hosted github.io link instead.";
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  var DEFAULT_ID = "eph1-3"; /* the first of the owner's own passages */
  /* Passage list: ids, groups and references only. The Scripture text lives in data/text/<book>.json,
     one file per book, loaded at start-up (see loadText) and precached by the service worker. */
  var PASSAGES = [{"id":"rom3-23","group":"The gospel","ref":"Romans 3:23"},{"id":"rom6-23","group":"The gospel","ref":"Romans 6:23"},{"id":"rom5-8","group":"The gospel","ref":"Romans 5:8"},{"id":"john3-16","group":"The gospel","ref":"John 3:16"},{"id":"eph2-8","group":"The gospel","ref":"Ephesians 2:8–10"},{"id":"rom10-9","group":"The gospel","ref":"Romans 10:9–10"},{"id":"john1-12","group":"The gospel","ref":"John 1:12"},{"id":"col1-15","group":"Who Jesus is","ref":"Colossians 1:15–16"},{"id":"1jn5-11","group":"Assurance and forgiveness","ref":"1 John 5:11–13"},{"id":"rom8-1","group":"Assurance and forgiveness","ref":"Romans 8:1–2"},{"id":"1jn1-9","group":"Assurance and forgiveness","ref":"1 John 1:9"},{"id":"rom8-38","group":"Assurance and forgiveness","ref":"Romans 8:38–39"},{"id":"2cor5-17","group":"New life in Christ","ref":"2 Corinthians 5:17"},{"id":"gal2-20","group":"New life in Christ","ref":"Galatians 2:20"},{"id":"rom12-1","group":"New life in Christ","ref":"Romans 12:1–2"},{"id":"gal5-22","group":"New life in Christ","ref":"Galatians 5:22–23"},{"id":"eph1-3","group":"New life in Christ","ref":"Ephesians 1:3–6"},{"id":"ps119-11","group":"God’s Word and prayer","ref":"Psalm 119:11"},{"id":"2tim3-16","group":"God’s Word and prayer","ref":"2 Timothy 3:16–17"},{"id":"josh1-8","group":"God’s Word and prayer","ref":"Joshua 1:8"},{"id":"heb4-12","group":"God’s Word and prayer","ref":"Hebrews 4:12"},{"id":"john15-7","group":"God’s Word and prayer","ref":"John 15:7"},{"id":"eph1-15","group":"God’s Word and prayer","ref":"Ephesians 1:15–23"},{"id":"eph3-14","group":"God’s Word and prayer","ref":"Ephesians 3:14–21"},{"id":"heb4-15","group":"God’s Word and prayer","ref":"Hebrews 4:15–16"},{"id":"prov3-5","group":"Trust and peace","ref":"Proverbs 3:5–6"},{"id":"matt6-33","group":"Trust and peace","ref":"Matthew 6:33"},{"id":"phil4-6","group":"Trust and peace","ref":"Philippians 4:6–7"},{"id":"1pet5-7","group":"Trust and peace","ref":"1 Peter 5:7"},{"id":"isa41-10","group":"Trust and peace","ref":"Isaiah 41:10"},{"id":"josh1-9","group":"Trust and peace","ref":"Joshua 1:9"},{"id":"isa40-31","group":"Trust and peace","ref":"Isaiah 40:31"},{"id":"ps23","group":"Trust and peace","ref":"Psalm 23"},{"id":"rom8-28","group":"Trust and peace","ref":"Romans 8:28"},{"id":"phil4-13","group":"Strength and temptation","ref":"Philippians 4:13"},{"id":"1cor10-13","group":"Strength and temptation","ref":"1 Corinthians 10:13"},{"id":"eph6-10","group":"Strength and temptation","ref":"Ephesians 6:10–18"},{"id":"col3-16","group":"Love and fellowship","ref":"Colossians 3:16–17"},{"id":"1jn4-7","group":"Love and fellowship","ref":"1 John 4:7–12"},{"id":"heb10-24","group":"Love and fellowship","ref":"Hebrews 10:24–25"},{"id":"1jn3-13","group":"Love and fellowship","ref":"1 John 3:13–16"},{"id":"matt5-16","group":"Witness","ref":"Matthew 5:16"},{"id":"rom1-16","group":"Witness","ref":"Romans 1:16"},{"id":"1pet3-15","group":"Witness","ref":"1 Peter 3:15"},{"id":"matt28-19","group":"Witness","ref":"Matthew 28:19–20"}];
  var EXTRA = [{"id":"x-john3-17","group":"Course verses","ref":"John 3:17–18"},{"id":"x-1corinthians15-3","group":"Course verses","ref":"1 Corinthians 15:3–4"},{"id":"x-1peter2-24","group":"Course verses","ref":"1 Peter 2:24"},{"id":"x-titus3-5","group":"Course verses","ref":"Titus 3:5–7"},{"id":"x-mark1-15","group":"Course verses","ref":"Mark 1:15"},{"id":"x-acts3-19","group":"Course verses","ref":"Acts 3:19"},{"id":"x-romans10-11","group":"Course verses","ref":"Romans 10:11–13"},{"id":"x-john5-24","group":"Course verses","ref":"John 5:24"},{"id":"x-john1-1","group":"Course verses","ref":"John 1:1–3"},{"id":"x-john1-14","group":"Course verses","ref":"John 1:14"},{"id":"x-philippians2-5","group":"Course verses","ref":"Philippians 2:5–8"},{"id":"x-colossians2-9","group":"Course verses","ref":"Colossians 2:9"},{"id":"x-hebrews1-1","group":"Course verses","ref":"Hebrews 1:1–3"},{"id":"x-hebrews2-14","group":"Course verses","ref":"Hebrews 2:14–18"},{"id":"x-john14-6","group":"Course verses","ref":"John 14:6"},{"id":"x-acts4-12","group":"Course verses","ref":"Acts 4:12"},{"id":"x-1corinthians15-17","group":"Course verses","ref":"1 Corinthians 15:17–20"},{"id":"x-romans6-9","group":"Course verses","ref":"Romans 6:9"},{"id":"x-hebrews7-25","group":"Course verses","ref":"Hebrews 7:25"},{"id":"x-exodus34-6","group":"Course verses","ref":"Exodus 34:6–7"},{"id":"x-psalm145-8","group":"Course verses","ref":"Psalm 145:8–9"},{"id":"x-isaiah6-3","group":"Course verses","ref":"Isaiah 6:3"},{"id":"x-1peter1-15","group":"Course verses","ref":"1 Peter 1:15–16"},{"id":"x-lamentations3-22","group":"Course verses","ref":"Lamentations 3:22–23"},{"id":"x-1corinthians1-9","group":"Course verses","ref":"1 Corinthians 1:9"},{"id":"x-psalm115-3","group":"Course verses","ref":"Psalm 115:3"},{"id":"x-daniel4-35","group":"Course verses","ref":"Daniel 4:35"},{"id":"x-2corinthians13-14","group":"Course verses","ref":"2 Corinthians 13:14"},{"id":"x-john17-3","group":"Course verses","ref":"John 17:3"},{"id":"x-jeremiah9-23","group":"Course verses","ref":"Jeremiah 9:23–24"},{"id":"x-psalm119-105","group":"Course verses","ref":"Psalm 119:105"},{"id":"x-psalm1-1","group":"Course verses","ref":"Psalm 1:1–3"},{"id":"x-james1-22","group":"Course verses","ref":"James 1:22–25"},{"id":"x-1peter2-2","group":"Course verses","ref":"1 Peter 2:2"},{"id":"x-acts17-11","group":"Course verses","ref":"Acts 17:11"},{"id":"x-hebrews4-14","group":"Course verses","ref":"Hebrews 4:14"},{"id":"x-matthew6-9","group":"Course verses","ref":"Matthew 6:9–13"},{"id":"x-mark11-22","group":"Course verses","ref":"Mark 11:22–24"},{"id":"x-james1-5","group":"Course verses","ref":"James 1:5–8"},{"id":"x-1thessalonians5-16","group":"Course verses","ref":"1 Thessalonians 5:16–18"},{"id":"x-colossians4-2","group":"Course verses","ref":"Colossians 4:2"},{"id":"x-1john5-14","group":"Course verses","ref":"1 John 5:14–15"},{"id":"x-1john1-3","group":"Course verses","ref":"1 John 1:3–7"},{"id":"x-psalm50-15","group":"Course verses","ref":"Psalm 50:15"},{"id":"x-james5-13","group":"Course verses","ref":"James 5:13–16"},{"id":"x-john14-16","group":"Course verses","ref":"John 14:16–17"},{"id":"x-acts1-8","group":"Course verses","ref":"Acts 1:8"},{"id":"x-1corinthians3-16","group":"Course verses","ref":"1 Corinthians 3:16"},{"id":"x-romans8-9","group":"Course verses","ref":"Romans 8:9–11"},{"id":"x-john16-13","group":"Course verses","ref":"John 16:13–15"},{"id":"x-galatians5-16","group":"Course verses","ref":"Galatians 5:16–18"},{"id":"x-1corinthians12-4","group":"Course verses","ref":"1 Corinthians 12:4–11"},{"id":"x-ephesians5-18","group":"Course verses","ref":"Ephesians 5:18–21"},{"id":"x-romans8-26","group":"Course verses","ref":"Romans 8:26–27"},{"id":"x-hebrews11-1","group":"Course verses","ref":"Hebrews 11:1–6"},{"id":"x-romans1-17","group":"Course verses","ref":"Romans 1:17"},{"id":"x-2corinthians5-7","group":"Course verses","ref":"2 Corinthians 5:7"},{"id":"x-psalm37-3","group":"Course verses","ref":"Psalm 37:3–7"},{"id":"x-philippians4-19","group":"Course verses","ref":"Philippians 4:19"},{"id":"x-matthew6-25","group":"Course verses","ref":"Matthew 6:25–32"},{"id":"x-matthew6-34","group":"Course verses","ref":"Matthew 6:34"},{"id":"x-matthew14-14","group":"Course verses","ref":"Matthew 14:14"},{"id":"x-matthew8-16","group":"Course verses","ref":"Matthew 8:16–17"},{"id":"x-1timothy6-6","group":"Course verses","ref":"1 Timothy 6:6–10"},{"id":"x-philippians4-11","group":"Course verses","ref":"Philippians 4:11–12"},{"id":"x-james1-2","group":"Course verses","ref":"James 1:2–4"},{"id":"x-romans5-3","group":"Course verses","ref":"Romans 5:3–5"},{"id":"x-romans5-1","group":"Course verses","ref":"Romans 5:1"},{"id":"x-2corinthians5-21","group":"Course verses","ref":"2 Corinthians 5:21"},{"id":"x-romans6-6","group":"Course verses","ref":"Romans 6:6–8"},{"id":"x-romans6-10","group":"Course verses","ref":"Romans 6:10–14"},{"id":"x-james1-12","group":"Course verses","ref":"James 1:12–15"},{"id":"x-ephesians4-31","group":"Course verses","ref":"Ephesians 4:31–32"},{"id":"x-colossians3-12","group":"Course verses","ref":"Colossians 3:12–14"},{"id":"x-2peter1-5","group":"Course verses","ref":"2 Peter 1:5–8"},{"id":"x-philippians2-12","group":"Course verses","ref":"Philippians 2:12–13"},{"id":"x-1corinthians12-12","group":"Course verses","ref":"1 Corinthians 12:12–27"},{"id":"x-acts2-42","group":"Course verses","ref":"Acts 2:42–47"},{"id":"x-john13-34","group":"Course verses","ref":"John 13:34–35"},{"id":"x-galatians5-13","group":"Course verses","ref":"Galatians 5:13"},{"id":"x-1peter4-10","group":"Course verses","ref":"1 Peter 4:10"},{"id":"x-ephesians4-1","group":"Course verses","ref":"Ephesians 4:1–6"},{"id":"x-colossians3-15","group":"Course verses","ref":"Colossians 3:15"},{"id":"x-matthew18-15","group":"Course verses","ref":"Matthew 18:15–17"},{"id":"x-ephesians4-11","group":"Course verses","ref":"Ephesians 4:11–16"},{"id":"x-james4-7","group":"Course verses","ref":"James 4:7–8"},{"id":"x-1peter5-8","group":"Course verses","ref":"1 Peter 5:8–9"},{"id":"x-colossians2-13","group":"Course verses","ref":"Colossians 2:13–15"},{"id":"x-luke10-17","group":"Course verses","ref":"Luke 10:17–20"},{"id":"x-romans8-37","group":"Course verses","ref":"Romans 8:37"},{"id":"x-1john5-4","group":"Course verses","ref":"1 John 5:4–5"},{"id":"x-2corinthians10-3","group":"Course verses","ref":"2 Corinthians 10:3–5"},{"id":"x-1john4-1","group":"Course verses","ref":"1 John 4:1–4"},{"id":"x-matthew5-13","group":"Course verses","ref":"Matthew 5:13–15"},{"id":"x-1corinthians13-1","group":"Course verses","ref":"1 Corinthians 13:1–7"},{"id":"x-proverbs10-9","group":"Course verses","ref":"Proverbs 10:9"},{"id":"x-titus2-7","group":"Course verses","ref":"Titus 2:7–8"},{"id":"x-colossians3-23","group":"Course verses","ref":"Colossians 3:23–24"},{"id":"x-luke16-10","group":"Course verses","ref":"Luke 16:10–12"},{"id":"x-2corinthians9-6","group":"Course verses","ref":"2 Corinthians 9:6–8"},{"id":"x-ephesians4-29","group":"Course verses","ref":"Ephesians 4:29"},{"id":"x-james1-19","group":"Course verses","ref":"James 1:19"},{"id":"x-romans12-17","group":"Course verses","ref":"Romans 12:17–21"},{"id":"x-philippians1-9","group":"Course verses","ref":"Philippians 1:9–11"},{"id":"x-matthew28-18","group":"Course verses","ref":"Matthew 28:18"},{"id":"x-1peter3-16","group":"Course verses","ref":"1 Peter 3:16"},{"id":"x-2timothy2-1","group":"Course verses","ref":"2 Timothy 2:1–2"},{"id":"x-hebrews12-1","group":"Course verses","ref":"Hebrews 12:1–3"},{"id":"x-1thessalonians4-16","group":"Course verses","ref":"1 Thessalonians 4:16–18"},{"id":"x-1corinthians15-51","group":"Course verses","ref":"1 Corinthians 15:51–57"},{"id":"x-revelation21-1","group":"Course verses","ref":"Revelation 21:1–5"},{"id":"x-colossians3-1","group":"Course verses","ref":"Colossians 3:1–4"}];
  var ALT = { ASV: {}, BBE: {} };
  PASSAGES.concat(EXTRA).forEach(function (p) { var t = TEXT[p.id]; p.verses = t.KJV; ALT.ASV[p.id] = t.ASV; ALT.BBE[p.id] = t.BBE; });
  var VERSIONS = [
    { id: "KJV", label: "KJV – King James" },
    { id: "ASV", label: "ASV – American Standard (1901)" },
    { id: "BBE", label: "BBE – Bible in Basic English" }
  ];
  var LINK_VERSIONS = ["NIV", "NLT", "NKJV"];

  /* ---- Course data ----
     EXTRA lists ONLY passages that are not already in PASSAGES.
     CURRICULUM holds metadata and references only; it never copies Scripture text. */
  var CURRICULUM = {"levels":[{"n":1,"name":"New Birth","desc":"For new believers establishing their understanding of the gospel, salvation, Jesus Christ, the Bible, and their new identity in Christ."},{"n":2,"name":"Established Believer","desc":"For believers developing consistent fellowship with God, understanding the Holy Spirit, growing in faith, and learning to live according to Scripture."},{"n":3,"name":"Growing Disciple","desc":"For believers growing in spiritual maturity, Christian character, church participation, spiritual authority, service, evangelism, and their eternal hope."}],"modules":[{"id":"gospel","level":1,"title":"The Gospel and Salvation","purpose":"Establish a clear understanding of humanity’s need for salvation, the death and resurrection of Jesus Christ, salvation by grace through faith, repentance, and assurance of salvation.","note":null,"topics":[{"t":"Humanity’s need for salvation","refs":["Romans 3:23","Romans 6:23"]},{"t":"God’s love and the gift of salvation","refs":["John 3:16–18","Romans 5:8"]},{"t":"The death and resurrection of Jesus","refs":["1 Corinthians 15:3–4","1 Peter 2:24"]},{"t":"Salvation by grace through faith","refs":["Ephesians 2:8–9","Titus 3:5–7"]},{"t":"Repentance and faith","refs":["Mark 1:15","Acts 3:19"]},{"t":"Confessing and believing in Christ","refs":["Romans 10:9–13"]},{"t":"Assurance of eternal life","refs":["1 John 5:11–13","John 5:24"]}],"priority":["1 Corinthians 15:3–4","Ephesians 2:8–9","1 John 5:11–12","Romans 10:9"]},{"id":"jesus","level":1,"title":"The Person of Jesus Christ","purpose":"Establish the identity of Jesus Christ, including His deity, humanity, incarnation, sinlessness, death, resurrection, and present position.","note":null,"topics":[{"t":"Jesus as the Word who was with God and is God","refs":["John 1:1–3"]},{"t":"The incarnation","refs":["John 1:14","Philippians 2:5–8"]},{"t":"The deity of Christ","refs":["Colossians 1:15–16","Colossians 2:9","Hebrews 1:1–3"]},{"t":"The humanity of Christ","refs":["Hebrews 2:14–18","Hebrews 4:15"]},{"t":"Jesus as the only way to the Father","refs":["John 14:6","Acts 4:12"]},{"t":"The resurrection of Jesus","refs":["1 Corinthians 15:17–20","Romans 6:9"]},{"t":"Christ’s present reign and intercession","refs":["Ephesians 1:20–23","Hebrews 7:25"]}],"priority":["John 1:1","John 1:14","John 14:6","Colossians 2:9"]},{"id":"god","level":1,"title":"Understanding God","purpose":"Introduce the character of God, His holiness, love, faithfulness, sovereignty, and the biblical understanding of the Father, Son, and Holy Spirit.","note":null,"topics":[{"t":"God’s nature and character","refs":["Exodus 34:6–7","Psalm 145:8–9"]},{"t":"God is holy","refs":["Isaiah 6:3","1 Peter 1:15–16"]},{"t":"God is love","refs":["1 John 4:7–10"]},{"t":"God’s faithfulness","refs":["Lamentations 3:22–23","1 Corinthians 1:9"]},{"t":"God’s sovereignty","refs":["Psalm 115:3","Daniel 4:35"]},{"t":"The Father, Son, and Holy Spirit","refs":["Matthew 28:19","2 Corinthians 13:14"]},{"t":"Knowing God personally","refs":["John 17:3","Jeremiah 9:23–24"]}],"priority":["Matthew 28:19","1 John 4:9–10","Lamentations 3:22–23"]},{"id":"word","level":1,"title":"The Bible and the Word of God","purpose":"Establish confidence in Scripture and encourage consistent engagement with the Word through recitation, meditation, understanding, and application.","note":null,"topics":[{"t":"Scripture is inspired by God","refs":["2 Timothy 3:16–17"]},{"t":"The Word of God is living and active","refs":["Hebrews 4:12"]},{"t":"The Word as a lamp and light","refs":["Psalm 119:105"]},{"t":"Meditating on the Word","refs":["Joshua 1:8","Psalm 1:1–3"]},{"t":"Receiving and obeying the Word","refs":["James 1:22–25"]},{"t":"The importance of Scripture in spiritual growth","refs":["1 Peter 2:2"]},{"t":"Testing teachings against Scripture","refs":["Acts 17:11"]}],"priority":["2 Timothy 3:16–17","Psalm 119:105","Psalm 1:1–3","Joshua 1:8"]},{"id":"prayer","level":2,"title":"Prayer and Fellowship with God","purpose":"Help believers develop a consistent prayer life, understand prayer biblically, grow in fellowship with God, and approach Him with confidence.","note":null,"topics":[{"t":"Approaching God through Christ","refs":["Hebrews 4:14–16"]},{"t":"The Lord’s Prayer as a model","refs":["Matthew 6:9–13"]},{"t":"Praying with faith","refs":["Mark 11:22–24","James 1:5–8"]},{"t":"Praying continually","refs":["1 Thessalonians 5:16–18"]},{"t":"Prayer and thanksgiving","refs":["Philippians 4:6–7","Colossians 4:2"]},{"t":"Praying according to God’s will","refs":["1 John 5:14–15"]},{"t":"Fellowship with God","refs":["1 John 1:3–7"]},{"t":"Prayer in times of trouble","refs":["Psalm 50:15","James 5:13–16"]}],"priority":["Philippians 4:6–7","1 Thessalonians 5:17","Hebrews 4:16","1 John 5:14–15"]},{"id":"spirit","level":2,"title":"The Holy Spirit","purpose":"Help believers understand the person and work of the Holy Spirit, His indwelling presence, guidance, empowerment, and role in developing Christian character.","note":null,"topics":[{"t":"The promise of the Holy Spirit","refs":["John 14:16–17","Acts 1:8"]},{"t":"The indwelling of the Holy Spirit","refs":["1 Corinthians 3:16","Romans 8:9–11"]},{"t":"The Spirit’s work in the believer","refs":["John 16:13–15"]},{"t":"Walking in the Spirit","refs":["Galatians 5:16–18"]},{"t":"The fruit of the Spirit","refs":["Galatians 5:22–23"]},{"t":"Spiritual gifts and service","refs":["1 Corinthians 12:4–11"]},{"t":"Being filled with the Spirit","refs":["Ephesians 5:18–21"]},{"t":"The Spirit’s help in prayer","refs":["Romans 8:26–27"]}],"priority":["Acts 1:8","Galatians 5:22–23","Romans 8:9–11","Romans 8:26–27"]},{"id":"faith","level":2,"title":"Faith, Healing, and Divine Provision","purpose":"Build a biblical understanding of faith, trusting God, healing, provision, contentment, and dependence on Him in difficult circumstances.","note":"These Scriptures speak of God’s care, of prayer for the sick, and of provision. They sit alongside Scripture’s teaching on suffering, patience, wisdom and contentment (see the last two topics). Not every illness is healed straight away, not every believer becomes wealthy, and a request that goes unanswered isn’t proof of weak faith. Trust God’s care, pray, seek wise help, and keep going.","topics":[{"t":"What faith is","refs":["Hebrews 11:1–6"]},{"t":"Living by faith","refs":["Romans 1:16–17","2 Corinthians 5:7"]},{"t":"Trusting God","refs":["Proverbs 3:5–6","Psalm 37:3–7"]},{"t":"God’s provision","refs":["Philippians 4:19","Matthew 6:25–34"]},{"t":"Prayer for healing","refs":["James 5:14–16"]},{"t":"Jesus’ compassion toward the sick","refs":["Matthew 14:14","Matthew 8:16–17"]},{"t":"Contentment and godliness","refs":["1 Timothy 6:6–10","Philippians 4:11–13"]},{"t":"Persevering through trials","refs":["James 1:2–4","Romans 5:3–5"]}],"priority":["Hebrews 11:6","Proverbs 3:5–6","Philippians 4:19","Philippians 4:11–13"]},{"id":"newlife","level":2,"title":"New Life in Christ","purpose":"Help believers understand their new identity in Christ and develop a lifestyle shaped by the gospel.","note":null,"topics":[{"t":"A new creation in Christ","refs":["2 Corinthians 5:17"]},{"t":"No condemnation in Christ","refs":["Romans 8:1–2"]},{"t":"Righteousness and justification","refs":["Romans 5:1","2 Corinthians 5:21"]},{"t":"Freedom from sin’s dominion","refs":["Romans 6:6–14"]},{"t":"Renewing the mind","refs":["Romans 12:1–2"]},{"t":"Overcoming temptation","refs":["1 Corinthians 10:13","James 1:12–15"]},{"t":"Forgiveness and reconciliation","refs":["Ephesians 4:31–32","Colossians 3:12–14"]},{"t":"Growing in Christlikeness","refs":["2 Peter 1:5–8","Philippians 2:12–13"]}],"priority":["2 Corinthians 5:17","Romans 8:1","Romans 12:2","1 Corinthians 10:13"]},{"id":"church","level":3,"title":"Church and Christian Fellowship","purpose":"Teach the importance of belonging to the body of Christ, Christian fellowship, mutual encouragement, love, service, and unity.","note":null,"topics":[{"t":"The Church as the body of Christ","refs":["1 Corinthians 12:12–27"]},{"t":"Fellowship among believers","refs":["Acts 2:42–47"]},{"t":"The importance of gathering together","refs":["Hebrews 10:24–25"]},{"t":"Loving one another","refs":["John 13:34–35"]},{"t":"Serving one another","refs":["Galatians 5:13","1 Peter 4:10"]},{"t":"Unity in Christ","refs":["Ephesians 4:1–6"]},{"t":"Forgiveness and reconciliation within the Church","refs":["Colossians 3:13–15","Matthew 18:15–17"]},{"t":"Spiritual leadership and maturity","refs":["Ephesians 4:11–16"]}],"priority":["John 13:34–35","Hebrews 10:24–25","1 Peter 4:10"]},{"id":"warfare","level":3,"title":"Spiritual Warfare and the Believer’s Authority","purpose":"Introduce the biblical reality of spiritual opposition, the believer’s identity and authority in Christ, and the importance of standing firm in faith and truth.","note":null,"topics":[{"t":"The reality of spiritual opposition","refs":["Ephesians 6:10–12"]},{"t":"The armour of God","refs":["Ephesians 6:13–18"]},{"t":"Resisting the devil","refs":["James 4:7–8","1 Peter 5:8–9"]},{"t":"Christ’s victory over spiritual powers","refs":["Colossians 2:13–15"]},{"t":"Authority and victory in Christ","refs":["Luke 10:17–20","Romans 8:37–39"]},{"t":"Overcoming through faith","refs":["1 John 5:4–5"]},{"t":"Standing firm in the gospel","refs":["2 Corinthians 10:3–5"]},{"t":"The importance of truth and discernment","refs":["1 John 4:1–4"]}],"priority":["Ephesians 6:11","James 4:7","1 John 5:4–5"]},{"id":"living","level":3,"title":"Christian Living in the World","purpose":"Help believers live out their faith in their character, relationships, work, speech, decisions, and responsibilities.","note":null,"topics":[{"t":"Living as a representative of Christ","refs":["Matthew 5:13–16"]},{"t":"Love as the defining mark of Christian life","refs":["1 Corinthians 13:1–7"]},{"t":"Integrity and godly character","refs":["Proverbs 10:9","Titus 2:7–8"]},{"t":"Honouring God in daily work","refs":["Colossians 3:23–24"]},{"t":"Stewardship and responsibility","refs":["Luke 16:10–12"]},{"t":"Giving and generosity","refs":["2 Corinthians 9:6–8"]},{"t":"Wisdom in speech and relationships","refs":["Ephesians 4:29","James 1:19"]},{"t":"Handling anxiety and life’s pressures","refs":["Matthew 6:25–34","1 Peter 5:7"]},{"t":"Pursuing peace and forgiveness","refs":["Romans 12:17–21"]},{"t":"Growing in wisdom and discernment","refs":["James 1:5","Philippians 1:9–11"]}],"priority":["Matthew 5:16","Colossians 3:23","Ephesians 4:29","1 Peter 5:7"]},{"id":"mission","level":3,"title":"Mission and the Future of the Believer","purpose":"Establish the believer’s role in the Great Commission, the importance of sharing the gospel, perseverance in the Christian journey, and the hope of Christ’s return and eternity.","note":null,"topics":[{"t":"The Great Commission","refs":["Matthew 28:18–20"]},{"t":"Being a witness for Christ","refs":["Acts 1:8"]},{"t":"The gospel as the power of God","refs":["Romans 1:16"]},{"t":"Sharing the gospel with wisdom","refs":["1 Peter 3:15–16"]},{"t":"Making disciples","refs":["2 Timothy 2:1–2"]},{"t":"Persevering in the Christian race","refs":["Hebrews 12:1–3"]},{"t":"The hope of Christ’s return","refs":["1 Thessalonians 4:16–18"]},{"t":"The resurrection and eternal life","refs":["1 Corinthians 15:51–57"]},{"t":"The new heaven and new earth","refs":["Revelation 21:1–5"]},{"t":"Living with an eternal perspective","refs":["Colossians 3:1–4"]}],"priority":["Matthew 28:19–20","Romans 1:16","Hebrews 12:1–2","Revelation 21:4"]}]};

  var MODES = [
    { id: "read", label: "Read" },
    { id: "fade", label: "Fade" },
    { id: "letters", label: "First letters" },
    { id: "type", label: "Type it" },
    { id: "speak", label: "Recite" }
  ];
  var LEVELS = [
    { v: 1, label: "Still shaky", days: 1 },
    { v: 2, label: "Getting there", days: 3 },
    { v: 3, label: "Solid", days: 7 }
  ];

  /* ---------- storage (always guarded) ---------- */
  var mem = {};
  function load() {
    try { var s = localStorage.getItem("kjv-verses-v1"); if (s) return JSON.parse(s); } catch (e) {}
    return mem.progress || {};
  }
  function save(p) {
    mem.progress = p;
    try { localStorage.setItem("kjv-verses-v1", JSON.stringify(p)); } catch (e) {}
    if (typeof markDay === "function" && typeof days !== "undefined") markDay(2);
    askPersist();
  }
  /* Ask the browser not to evict our data under storage pressure. Asked once per session, after real use. */
  var persistAsked = false, persisted = null;
  function askPersist() {
    if (persistAsked || !navigator.storage || !navigator.storage.persist) return;
    persistAsked = true;
    navigator.storage.persist().then(function (ok) { persisted = ok; }).catch(function () {});
  }
  if (navigator.storage && navigator.storage.persisted) navigator.storage.persisted().then(function (ok) { persisted = ok; }).catch(function () {});
  var progress = load();
  /* Favorites: a list of passage ids (the same ids progress uses). Days: {"YYYY-MM-DD": 1 opened | 2 practised}. */
  function loadKey(k, fallback) {
    try { var v = localStorage.getItem(k); if (v) return JSON.parse(v); } catch (e) {}
    return mem[k] || fallback;
  }
  function saveKey(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var favs = loadKey("kjv-verses-favs", []);
  if (!Array.isArray(favs)) favs = [];
  var daysSeeded = false;
  var days = loadKey("kjv-verses-days", null);
  function dateKey(t) { var d = new Date(t); function z(n) { return (n < 10 ? "0" : "") + n; } return d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate()); }
  function markDay(level) {
    var k = dateKey(Date.now());
    if (!days) {
      days = {}; daysSeeded = true;
      Object.keys(progress).forEach(function (id) { var l = progress[id] && progress[id].last; if (l) days[dateKey(l)] = 2; });
    }
    if ((days[k] || 0) < level) { days[k] = level; saveKey("kjv-verses-days", days); }
  }
  var themePref = null;
  try { themePref = localStorage.getItem("kjv-verses-theme"); } catch (e) {}
  if (themePref) document.documentElement.setAttribute("data-theme", themePref);

  /* ---------- state ---------- */
  var state = {
    pid: DEFAULT_ID, ppid: DEFAULT_ID, view: "course", screen: "home", mod: null, ctx: null, mode: "read", verse: null,
    ver: "KJV", fade: 40, seed: 1, revealed: {}, typed: "", spoken: "", listening: false, speakMsg: "", result: null, showHints: false, justSaved: false
  };
  try { var lastV = localStorage.getItem("kjv-verses-ver"); if (lastV && VERSIONS.some(function (v) { return v.id === lastV; })) state.ver = lastV; } catch (e) {}
  try { var lastP = localStorage.getItem("kjv-verses-last"); if (lastP && PASSAGES.some(function (p) { return p.id === lastP; })) { state.pid = lastP; state.ppid = lastP; } } catch (e) {}
  try { var lastView = localStorage.getItem("kjv-verses-view"); if (lastView === "course" || lastView === "passages" || lastView === "favs" || lastView === "days") state.view = lastView; } catch (e) {}
  state.fpid = null;
  if (state.view !== "course") state.screen = "practice";

  /* One lookup for every verse the app holds: PASSAGES + EXTRA records. Curriculum references are resolved
     against it, so nothing is copied and existing records, ids and progress stay untouched. */
  var BYID = {}, VIDX = {}, UNITS = {};
  function bookChap(ref) { var m = /^(.+?) (\d+)/.exec(ref); return m ? [m[1], parseInt(m[2], 10)] : [ref, 0]; }
  PASSAGES.concat(EXTRA).forEach(function (p) {
    BYID[p.id] = p;
    var bc = bookChap(p.ref);
    p.verses.forEach(function (v) { VIDX[bc[0] + "|" + bc[1] + "|" + v[0]] = p.id; });
  });
  function parseRef(ref) {
    var m = /^(.+?) (\d+):(\d+)(?:[\u2013-](\d+))?$/.exec(ref);
    if (!m) return null;
    return { book: m[1], ch: parseInt(m[2], 10), v1: parseInt(m[3], 10), v2: parseInt(m[4] || m[3], 10) };
  }
  function refLabel(r) { return r.book + " " + r.ch + ":" + r.v1 + (r.v2 !== r.v1 ? "\u2013" + r.v2 : ""); }
  function unitForRef(ref) {
    var r = parseRef(ref); if (!r) return null;
    var ids = [], v, rid;
    for (v = r.v1; v <= r.v2; v++) { rid = VIDX[r.book + "|" + r.ch + "|" + v]; if (!rid) return null; ids.push(rid); }
    var rec = BYID[ids[0]];
    var same = ids.every(function (x) { return x === ids[0]; }) && rec.verses.length === ids.length && rec.verses[0][0] === r.v1 && rec.verses[rec.verses.length - 1][0] === r.v2;
    if (same) return rec;                                   // exactly an existing record: reuse it (and its progress)
    var key = "c:" + refLabel(r);
    if (!UNITS[key]) {
      var pick = function (list, n) { for (var i = 0; i < list.length; i++) if (list[i][0] === n) return list[i]; return null; };
      var kv = [], alt = { ASV: [], BBE: [] };
      for (v = r.v1; v <= r.v2; v++) {
        var rr = BYID[ids[v - r.v1]];
        kv.push(pick(rr.verses, v));
        ["ASV", "BBE"].forEach(function (ver) { var a = ALT[ver] && ALT[ver][rr.id] && pick(ALT[ver][rr.id], v); if (a) alt[ver].push(a); });
      }
      UNITS[key] = { id: key, group: "Course", ref: refLabel(r), verses: kv, alt: alt };
    }
    return UNITS[key];
  }
  function passage() {
    if (BYID[state.pid]) return BYID[state.pid];
    if (state.pid.indexOf("c:") === 0) { var u = unitForRef(state.pid.slice(2)); if (u) return u; }
    return BYID[DEFAULT_ID] || PASSAGES[0];
  }
  function modById(id) { return CURRICULUM.modules.filter(function (m) { return m.id === id; })[0]; }
  function flatTopics(m) { var out = []; m.topics.forEach(function (t) { t.refs.forEach(function (r) { out.push({ ref: r, topic: t.t }); }); }); return out; }
  function ctxList() {
    if (!state.ctx) return [];
    var m = modById(state.ctx.mod); if (!m) return [];
    return state.ctx.kind === "priority" ? m.priority : flatTopics(m).map(function (x) { return x.ref; });
  }
  function levelOfRef(ref) { var u = unitForRef(ref); return u ? (progress[u.id] || {}).level || 0 : 0; }
  function pipsHTML(level) { return '<span class="pips" aria-hidden="true">' + [1, 2, 3].map(function (n) { return '<span class="pip' + (level >= n ? " on" : "") + '"></span>'; }).join("") + '</span>'; }
  function memStats(m) { var t = m.priority.length, s = 0; m.priority.forEach(function (r) { if (levelOfRef(r) === 3) s++; }); return { total: t, solid: s }; }
  function versesOf(p) {
    if (state.ver === "KJV") return p.verses;
    return (p.alt && p.alt[state.ver] && p.alt[state.ver].length ? p.alt[state.ver] : null) || (ALT[state.ver] && ALT[state.ver][p.id]) || p.verses;
  }
  function verName(id) { return (VERSIONS.filter(function (v) { return v.id === id; })[0] || {}).label || id; }
  function gatewayUrl(p, v) { return "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(p.ref.replace("–", "-")) + "&version=" + v; }
  function activeVerses() {
    var p = passage();
    var vs = versesOf(p) || [];
    return vs.filter(function (v) { return state.verse === null || v[0] === state.verse; });
  }

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function norm(w) { return w.toLowerCase().replace(/\u00e6/g, "ae").replace(/ae/g, "e").replace(/[^a-z0-9]/g, ""); }
  function rng(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function wordsOf(verses) {
    var out = [];
    verses.forEach(function (v) { v[1].split(/\s+/).forEach(function (w) { out.push({ v: v[0], w: w }); }); });
    return out;
  }
  function dayMs(n) { return n * 86400000; }
  function startOfDay(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function isFav(id) { return favs.indexOf(id) >= 0; }
  function toggleFav(id) {
    var i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1); else favs.push(id);
    saveKey("kjv-verses-favs", favs);
  }
  function unitById(id) {
    if (BYID[id]) return BYID[id];
    if (typeof id === "string" && id.indexOf("c:") === 0) return unitForRef(id.slice(2));
    return null;
  }
  function favUnits() { return favs.map(unitById).filter(Boolean); }
  function dayNum(k) { var p = k.split("-"); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 86400000); }
  function streakStats() {
    markDay(1);
    var keys = Object.keys(days).filter(function (k) { return days[k]; }), nums = keys.map(dayNum).sort(function (a, b) { return a - b; });
    var set = {}; nums.forEach(function (n) { set[n] = 1; });
    var today = dayNum(dateKey(Date.now())), cur = 0, n = set[today] ? today : today - 1;
    while (set[n]) { cur++; n--; }
    var best = 0, run = 0, prev = null;
    nums.forEach(function (x) { run = prev !== null && x === prev + 1 ? run + 1 : 1; if (run > best) best = run; prev = x; });
    var practised = keys.filter(function (k) { return days[k] === 2; }).length;
    var week = 0, i; for (i = 0; i < 7; i++) if (set[today - i]) week++;
    return { cur: cur, best: best, total: keys.length, practised: practised, week: week, today: today };
  }
  function dueInfo(id) {
    var s = progress[id];
    if (!s || !s.level) return { text: "Not started", due: false };
    var next = startOfDay(s.last) + dayMs(HidCore.intervalOf(s));
    var diff = Math.round((next - startOfDay(Date.now())) / 86400000);
    if (diff <= 0) return { text: "Due today", due: true };
    return { text: "Review in " + diff + (diff === 1 ? " day" : " days"), due: false };
  }

  /* ---------- render ---------- */
  var elPassages = document.getElementById("passages");
  var elPanel = document.getElementById("panel");

  function renderPassages() {
    var vb = document.querySelectorAll("#views .view-btn");
    for (var i = 0; i < vb.length; i++) { var on = vb[i].getAttribute("data-view") === state.view; vb[i].setAttribute("aria-selected", String(on)); vb[i].tabIndex = on ? 0 : -1; }
    var lay = document.getElementById("layout"); if (lay) lay.className = "layout" + (state.view === "days" ? " solo" : "");
    var cb = document.querySelector('#views [data-view="days"]');
    if (cb) { var ss = streakStats(); cb.innerHTML = 'Consistency' + (ss.cur > 1 ? ' <span class="vb-n">· ' + ss.cur + '</span>' : ''); }
    if (state.view === "course") renderModuleList();
    else if (state.view === "favs") renderFavList();
    else if (state.view === "days") { elPassages.innerHTML = ""; }
    else renderPassageList();
  }
  function renderFavList() {
    document.getElementById("pSelLabel").textContent = "Favorite";
    var us = favUnits(), sel = document.getElementById("pSel");
    elPassages.innerHTML = '<div class="grp">Favorites<span>' + us.length + '</span></div>' + (us.length ? us.map(function (p) {
      var s = progress[p.id] || {}, d = dueInfo(p.id);
      var pips = [1, 2, 3].map(function (n) { return '<span class="pip' + ((s.level || 0) >= n ? " on" : "") + '"></span>'; }).join("");
      return '<button class="p-btn" type="button" data-id="' + esc(p.id) + '" aria-current="' + (p.id === state.pid) + '"><span class="p-ref">' + p.ref + '</span><span class="p-meta"><span class="pips" aria-hidden="true">' + pips + '</span><span class="' + (d.due ? "due" : "") + '">' + d.text + '</span></span></button>';
    }).join("") : '<p class="empty">Nothing here yet. Open any passage and tap Save.</p>');
    sel.innerHTML = us.length ? us.map(function (p) { return '<option value="' + esc(p.id) + '"' + (p.id === state.pid ? " selected" : "") + '>' + p.ref + '</option>'; }).join("") : '<option value="">No favorites yet</option>';
    var txt = us.length + (us.length === 1 ? " favorite" : " favorites");
    document.getElementById("statsMobile").textContent = txt;
    document.getElementById("summary").textContent = " · " + txt;
  }
  function renderConsistency() {
    var st = streakStats(), html = '<h2>Consistency</h2>';
    var msg = st.cur >= 2 ? "You have opened the app " + st.cur + " days in a row." : "Welcome. Every day you open the app is counted here, and a missed day is never a problem: just carry on where you left off.";
    html += '<p class="lead">' + msg + '</p>';
    html += '<div class="stats-row"><div class="stat"><b>' + st.cur + '</b><span>day streak</span></div><div class="stat"><b>' + st.best + '</b><span>longest streak</span></div><div class="stat"><b>' + st.week + ' of 7</b><span>days this week</span></div><div class="stat"><b>' + st.practised + '</b><span>days practised</span></div></div>';
    var dow = ["S", "M", "T", "W", "T", "F", "S"], now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 28);
    html += '<div class="cal" role="img" aria-label="Last five weeks. Filled days are days you opened the app.">' + dow.map(function (d) { return '<div class="dow" aria-hidden="true">' + d + '</div>'; }).join("");
    for (var i = 0; i < 35; i++) {
      var d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), k = dateKey(d.getTime()), v = days[k] || 0, t = dayNum(k);
      html += '<div class="day' + (v === 2 ? " did" : v === 1 ? " on" : "") + (t === st.today ? " today" : "") + (t > st.today ? " future" : "") + '" title="' + k + (v === 2 ? " · practised" : v === 1 ? " · opened" : "") + '"></div>';
    }
    html += '</div><div class="legend"><span><i class="on"></i>Opened</span><span><i class="did"></i>Practised</span></div>';
    var due = dueUnits();
    html += '<h3 class="sect">Review today</h3>';
    html += due.length ? '<p>' + due.length + (due.length === 1 ? " passage is" : " passages are") + ' ready for review.</p><div class="refs">' + due.map(function (u) {
      return '<button class="refbtn key" type="button" data-due="' + esc(u.id) + '">' + esc(u.ref) + pipsHTML((progress[u.id] || {}).level || 0) + '</button>';
    }).join("") + '</div>' : '<p class="empty">Nothing is due today. Passages you rate come back here when it is time to review them.</p>';
    html += '<p class="foot">A day counts as opened when you open the app, and as practised when you rate or check a passage. ' + (daysSeeded ? 'Earlier days were filled in from the last time you practised each passage, so older history is incomplete. ' : '') + 'This is stored only on this device.</p>';
    html += dataHTML();
    html += '<p class="foot">App version: ' + APP_VERSION + ' · <a href="privacy.html">Privacy</a> · <a href="about.html">About</a> · <a href="about.html#support">Support this ministry</a></p>';
    elPanel.innerHTML = html;
    renderPassages();
  }
  /* Every passage with a rating that is due today: list passages, course passages and course ranges. */
  function dueUnits() {
    return Object.keys(progress).map(unitById).filter(function (u) { return u && dueInfo(u.id).due; })
      .sort(function (a, b) { return ((progress[a.id] || {}).last || 0) - ((progress[b.id] || {}).last || 0); });
  }
  function dataHTML() {
    var h = '<h3 class="sect" id="yourData">Your data</h3>';
    h += '<p class="caution">Your progress is kept only in this browser on this device. Clearing your browser data, using a private window, or moving to another browser or device will lose it. Export a copy now and then to keep it safe.' +
      (persisted === true ? ' This browser has agreed to keep the data unless you clear it yourself.' : '') + '</p>';
    h += '<div class="row"><button class="btn" type="button" id="exportData">Export my data</button>' +
      '<input type="file" id="importFile" class="sr" accept="application/json,.json"><label class="btn" for="importFile">Import data</label>' +
      '<button class="btn" type="button" id="clearData">Clear all data</button></div>';
    h += '<p class="note" id="dataMsg" role="status" aria-live="polite">' + esc(state.dataMsg || "") + '</p>';
    return h;
  }
  function exportData() {
    var doc = HidCore.exportData(localStorage);
    var blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hid-in-my-heart-" + dateKey(Date.now()) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    setDataMsg("Exported. Keep the file somewhere safe; it holds your ratings, favorites and practice days.");
  }
  function setDataMsg(m) { state.dataMsg = m; var el = document.getElementById("dataMsg"); if (el) el.textContent = m; }
  function importFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var res = HidCore.parseImport(String(reader.result));
      if (!res.ok) { setDataMsg("Import failed: " + res.error + " Nothing was changed."); return; }
      if (!window.confirm("Replace the progress in this browser with the data in this file? This cannot be undone.")) { setDataMsg("Import cancelled. Nothing was changed."); return; }
      HidCore.importData(localStorage, res.data);
      location.reload();
    };
    reader.onerror = function () { setDataMsg("That file could not be read. Nothing was changed."); };
    reader.readAsText(file);
  }
  function clearData() {
    if (!window.confirm("Delete all your progress, favorites, practice days and settings from this browser? This cannot be undone. Export first if you want a copy.")) return;
    HidCore.clearAll(localStorage);
    location.reload();
  }
  function renderModuleList() {
    var allRefs = {}, solidAll = 0, totalAll = 0;
    CURRICULUM.modules.forEach(function (m) { m.priority.forEach(function (r) { if (!allRefs[r]) { allRefs[r] = 1; totalAll++; if (levelOfRef(r) === 3) solidAll++; } }); });
    elPassages.innerHTML = [CURRICULUM.modules].map(function (mods) {
      return mods.map(function (m) {
        var st = memStats(m);
        return '<button class="p-btn" type="button" data-mod="' + m.id + '" aria-current="' + (state.mod === m.id && state.screen !== "home") + '"><span class="p-ref">' + m.title + '</span><span class="p-meta">' + st.solid + ' of ' + st.total + ' memory verses solid</span></button>';
      }).join("");
    }).join("");
    var sel = document.getElementById("pSel");
    document.getElementById("pSelLabel").textContent = "Module";
    sel.innerHTML = '<option value="">All modules</option>' + CURRICULUM.modules.map(function (m) {
      return '<option value="' + m.id + '"' + (state.mod === m.id && state.screen !== "home" ? " selected" : "") + '>' + m.title + '</option>';
    }).join("");
    var txt = solidAll + " of " + totalAll + " memory verses solid";
    document.getElementById("statsMobile").textContent = txt;
    document.getElementById("summary").textContent = " · " + txt;
  }
  function renderPassageList() {
    document.getElementById("pSelLabel").textContent = "Passage";
    var groups = [], seen = {};
    PASSAGES.forEach(function (p) { if (!seen[p.group]) { seen[p.group] = { name: p.group, items: [] }; groups.push(seen[p.group]); } seen[p.group].items.push(p); });
    var solidAll = 0, dueAll = 0;
    var listHTML = groups.map(function (g) {
      var solid = g.items.filter(function (p) { return (progress[p.id] || {}).level === 3; }).length;
      var btns = g.items.map(function (p) {
        var s = progress[p.id] || {};
        var d = dueInfo(p.id);
        var pips = [1, 2, 3].map(function (n) { return '<span class="pip' + ((s.level || 0) >= n ? " on" : "") + '"></span>'; }).join("");
        return '<button class="p-btn" type="button" data-id="' + p.id + '" aria-current="' + (p.id === state.pid) + '">' +
          '<span class="p-ref">' + (isFav(p.id) ? '<span class="fstar" aria-label="Favorite">★</span>' : '') + p.ref + '</span>' +
          '<span class="p-meta"><span class="pips" aria-hidden="true">' + pips + '</span><span class="' + (d.due ? "due" : "") + '">' + d.text + '</span></span></button>';
      }).join("");
      return '<div class="grp">' + g.name + '<span>' + solid + ' of ' + g.items.length + ' solid</span></div>' + btns;
    }).join("");
    elPassages.innerHTML = listHTML;
    PASSAGES.forEach(function (p) { var s = progress[p.id] || {}; if (s.level === 3) solidAll++; if (dueInfo(p.id).due) dueAll++; });
    var sel = document.getElementById("pSel");
    sel.innerHTML = groups.map(function (g) {
      return '<optgroup label="' + g.name + '">' + g.items.map(function (p) {
        var d = dueInfo(p.id);
        return '<option value="' + p.id + '"' + (p.id === state.pid ? " selected" : "") + '>' + p.ref + (d.due ? "  (due)" : "") + '</option>';
      }).join("") + '</optgroup>';
    }).join("");
    var txt = solidAll + " of " + PASSAGES.length + " solid" + (dueAll ? " · " + dueAll + " due today" : "");
    document.getElementById("statsMobile").textContent = txt;
    document.getElementById("summary").textContent = " · " + txt;
    var cur = elPassages.querySelector('[aria-current="true"]');
    if (cur && cur.scrollIntoView && elPassages.offsetParent !== null) { try { cur.scrollIntoView({ block: "nearest" }); } catch (e) {} }
  }

  function scriptureHTML(verses, mode) {
    var order = [];
    var hiddenSet = {};
    var all = wordsOf(verses);
    if (mode === "fade") {
      var r = rng(state.seed + state.pid.length * 97);
      order = all.map(function (_, i) { return i; });
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
      var count = Math.round(order.length * state.fade / 100);
      for (var k = 0; k < count; k++) hiddenSet[order[k]] = true;
    }
    var idx = 0;
    return verses.map(function (v) {
      var words = v[1].split(/\s+/).map(function (w) {
        var i = idx++;
        var key = "w" + i;
        if (mode === "read") return esc(w);
        if (mode === "fade") {
          if (hiddenSet[i] && !state.revealed[key]) return '<button type="button" class="w hide" data-k="' + key + '" aria-label="Hidden word, tap to reveal">' + esc(w) + '</button>';
          if (hiddenSet[i]) return '<button type="button" class="w show-again" data-k="' + key + '" data-hide="1">' + esc(w) + '</button>';
          return esc(w);
        }
        if (mode === "letters") {
          if (state.revealed[key]) return '<button type="button" class="w show-again" data-k="' + key + '" data-hide="1">' + esc(w) + '</button>';
          var m = w.match(/^([^A-Za-z]*)([A-Za-z])([A-Za-z'’\-]*)([^A-Za-z]*)$/);
          if (!m) return esc(w);
          return '<button type="button" class="w initial" data-k="' + key + '" aria-label="Tap to reveal word">' + esc(m[1] + m[2]) + '<span aria-hidden="true">' + (m[3] ? "‥" : "") + '</span>' + esc(m[4]) + '</button>';
        }
        return esc(w);
      }).join(" ");
      return '<span class="vblock"><sup>' + v[0] + '</sup>' + words + '</span>';
    }).join("");
  }

  function renderCourse() {
    var html = "";
    if (state.screen === "home" || !modById(state.mod)) {
      html += '<h2>Course</h2><p class="lead">A guided path through Scripture, from the gospel to living it out. Take the modules in order, or open any one. Gold-outlined verses are the priority memory verses.</p>';
      CURRICULUM.modules.forEach(function (m) {
        var st = memStats(m);
        html += '<button class="mrow" type="button" data-mod="' + m.id + '"><span class="mt">' + m.title + '</span><span class="mp">' + m.purpose + '</span><span class="mm">' + st.solid + ' of ' + st.total + ' memory verses solid</span></button>';
      });
    } else {
      var m = modById(state.mod), st = memStats(m), idx = 0;
      html += '<div class="crumb"><button class="btn" type="button" id="toHome">← All modules</button></div>';
      html += '<h2>' + m.title + '</h2><p class="lead">' + m.purpose + '</p>';
      if (m.note) html += '<p class="caution">' + m.note + '</p>';
      html += '<div class="sect">Memory verses <span class="mm" style="display:inline">· ' + st.solid + ' of ' + st.total + ' solid</span></div><div class="refs">' + m.priority.map(function (r, i) {
        return '<button class="refbtn key" type="button" data-ref="' + esc(r) + '" data-kind="priority" data-i="' + i + '">' + r + pipsHTML(levelOfRef(r)) + '</button>';
      }).join("") + '</div>';
      html += '<div class="sect">Topics</div>' + m.topics.map(function (t) {
        return '<div class="topic"><h4>' + t.t + '</h4><div class="refs">' + t.refs.map(function (r) {
          var i = idx++;
          return '<button class="refbtn" type="button" data-ref="' + esc(r) + '" data-kind="topics" data-i="' + i + '">' + r + pipsHTML(levelOfRef(r)) + '</button>';
        }).join("") + '</div></div>';
      }).join("");
    }
    html += '<p class="foot">App version: ' + APP_VERSION + ' · <a href="privacy.html">Privacy</a> · <a href="about.html">About</a> · <a href="about.html#support">Support this ministry</a></p>';
    elPanel.innerHTML = html;
    renderPassages();
  }
  function crumbHTML() {
    if (state.view !== "course" || !state.ctx) return "";
    var m = modById(state.ctx.mod); if (!m) return "";
    var list = ctxList(), ref = list[state.ctx.i], label = "Memory verse";
    if (state.ctx.kind === "topics") { var f = flatTopics(m)[state.ctx.i]; label = f ? f.topic : ""; }
    return '<div class="crumb"><button class="btn" type="button" id="backMod">← ' + m.title + '</button><span>' + label + '</span></div>';
  }
  function pagerHTML(p) {
    var prev = null, next = null;
    if (state.view === "course" && state.ctx) {
      var list = ctxList(), i = state.ctx.i;
      prev = i > 0 ? list[i - 1] : null; next = i < list.length - 1 ? list[i + 1] : null;
    } else if (state.view === "favs") {
      var fu = favUnits(), fi = -1; fu.forEach(function (u, j) { if (u.id === p.id) fi = j; });
      prev = fi > 0 ? fu[fi - 1].ref : null; next = fi >= 0 && fi < fu.length - 1 ? fu[fi + 1].ref : null;
    } else {
      var ix = PASSAGES.indexOf(p);
      prev = ix > 0 ? PASSAGES[ix - 1].ref : null; next = ix >= 0 && ix < PASSAGES.length - 1 ? PASSAGES[ix + 1].ref : null;
    }
    return '<div class="pager">' + (prev ? '<button class="btn" type="button" data-nav="-1">Previous: ' + prev + '</button>' : '<span></span>') +
      (next ? '<button class="btn" type="button" data-nav="1">Next: ' + next + '</button>' : '') + '</div>';
  }

  function render() {
    markDay(1);
    if (state.view === "course" && state.screen !== "practice") { renderCourse(); return; }
    if (state.view === "days") { renderConsistency(); return; }
    if (state.view === "favs" && !favUnits().length) {
      elPanel.innerHTML = '<h2>Favorites</h2><p class="empty">Keep the Scriptures you love in one place. Open any passage, in the Course or in All passages, and tap <b>☆ Save</b>. It will appear here.</p>' +
        '<p class="foot">App version: ' + APP_VERSION + ' · <a href="privacy.html">Privacy</a> · <a href="about.html">About</a> · <a href="about.html#support">Support this ministry</a></p>';
      renderPassages(); return;
    }
    var p = passage();
    var s = progress[p.id] || {};
    var html = crumbHTML();
    html += '<div class="titlerow"><h2>' + p.ref + '</h2><button class="favbtn" type="button" id="favBtn" aria-pressed="' + isFav(p.id) + '" aria-label="' + (isFav(p.id) ? "Remove from favorites" : "Save to favorites") + '"><span class="st" aria-hidden="true">' + (isFav(p.id) ? "★" : "☆") + '</span> ' + (isFav(p.id) ? "Saved" : "Save") + '</button></div>';
    html += '<div class="modes" role="tablist" aria-label="Practice mode">' + MODES.map(function (m) {
      return '<button class="mode" role="tab" type="button" data-mode="' + m.id + '" aria-controls="panel" aria-selected="' + (m.id === state.mode) + '" tabindex="' + (m.id === state.mode ? 0 : -1) + '">' + m.label + '</button>';
    }).join("") + '</div>';

    html += '<div class="ver-row"><label for="verSel">Version</label><select id="verSel">' + VERSIONS.map(function (v) {
      return '<option value="' + v.id + '"' + (v.id === state.ver ? " selected" : "") + '>' + v.label + '</option>';
    }).join("") + '</select></div>';
    html += '<p class="links">Read this passage in: ' + LINK_VERSIONS.map(function (v) {
      return '<a href="' + gatewayUrl(p, v) + '" target="_blank" rel="noopener noreferrer" data-leave="BibleGateway">' + v + '</a>';
    }).join(" ") + '<span>(leaves this app for BibleGateway)</span></p>';

    var shown = versesOf(p);
    var pv = shown || p.verses;
    if (pv.length > 1) html += '<div class="verse-pick" aria-label="Choose verses"><button class="chip" type="button" data-verse="all" aria-pressed="' + (state.verse === null) + '">Whole passage</button>' +
      pv.map(function (v) { return '<button class="chip" type="button" data-verse="' + v[0] + '" aria-pressed="' + (state.verse === v[0]) + '">Verse ' + v[0] + '</button>'; }).join("") + '</div>';

    var verses = activeVerses();

    if (state.mode === "read") {
      html += '<p class="hint">Read it slowly and aloud, twice. Then move on to Fade.</p>';
      html += '<div class="scripture">' + scriptureHTML(verses, "read") + '</div>';
    } else if (state.mode === "fade") {
      html += '<p class="hint">Say the passage aloud and fill in each gap from memory. Tap a gap to check yourself. Raise the slider as it gets easier.</p>';
      html += '<div class="controls"><label>Hidden words <input type="range" id="fadeRange" min="0" max="100" step="10" value="' + state.fade + '" aria-valuetext="' + state.fade + ' percent"><span id="fadeVal">' + state.fade + '%</span></label>' +
        '<button class="btn" type="button" id="shuffle">Shuffle gaps</button><button class="btn" type="button" id="revealAll">Reset</button></div>';
      html += '<div class="scripture" id="scripture">' + scriptureHTML(verses, "fade") + '</div>';
    } else if (state.mode === "letters") {
      html += '<p class="hint">Only the first letter of each word is shown. Recite it, and tap any word you’re unsure of.</p>';
      html += '<div class="controls"><button class="btn" type="button" id="revealAll">Reset</button></div>';
      html += '<div class="scripture" id="scripture">' + scriptureHTML(verses, "letters") + '</div>';
    } else if (state.mode === "speak") {
      if (!SR) {
        html += '<p class="hint">Speech recognition isn’t available in this browser. Try Chrome, Edge or Safari, or use Type it instead.</p>';
      } else {
        if (INSECURE) html += '<p class="speak-msg err" style="margin:0 0 14px">' + FILE_MSG + '</p>';
        html += '<p class="hint">Press Start and recite the ' + (state.verse === null ? "passage" : "verse") + ' aloud from memory. Press Stop when you’re done and I’ll compare what I heard to the ' + esc(state.ver) + ' text. Your browser may ask to use the microphone.</p>';
        html += '<div class="mic-row"><button class="mic" type="button" id="micBtn" aria-pressed="' + state.listening + '"><span class="dot" aria-hidden="true"></span><span id="micLabel">' + (state.listening ? "Stop" : "Start reciting") + '</span></button><span class="speak-msg" id="speakMsg" role="status" aria-live="polite"></span></div>';
        html += '<textarea id="spoken" aria-label="What was heard" placeholder="Your words will appear here as you speak." spellcheck="false" autocomplete="off" autocapitalize="off"' + (state.listening ? " readonly" : "") + '>' + esc(state.spoken) + '</textarea>';
        html += '<div class="row"><button class="btn primary" type="button" id="checkSpeak">Check</button><button class="btn" type="button" id="clearSpeak">Clear</button></div><p class="note">If the Start button doesn’t work on your device, tap the box above and use the microphone key on your keyboard to dictate, then press Check.</p>';
        html += '<div id="result"></div>';
      }
    } else {
      html += '<p class="hint">Type the ' + (state.verse === null ? "passage" : "verse") + ' from memory. Capitals and punctuation don’t matter; spelling and word order do.</p>';
      if (state.showHints) html += '<div class="hint-block" id="hintBlock">' + scriptureHTML(verses, "letters").replace(/<button[^>]*>/g, "<span>").replace(/<\/button>/g, "</span>") + '</div>';
      html += '<textarea id="typed" aria-label="Type from memory" spellcheck="false" autocomplete="off" autocapitalize="off">' + esc(state.typed) + '</textarea>';
      html += '<div class="row"><button class="btn primary" type="button" id="checkBtn">Check</button><button class="btn" type="button" id="clearBtn">Clear</button>' +
        '<label class="check-label"><input type="checkbox" id="hintToggle"' + (state.showHints ? " checked" : "") + '> Show first letters</label></div>';
      html += '<div id="result"></div>';
    }

    html += '<div class="rate"><p>How well do you know this passage?</p><div class="opts">' + LEVELS.map(function (l) {
      return '<button class="opt" type="button" data-level="' + l.v + '" aria-pressed="' + (s.level === l.v) + '">' + l.label + '</button>';
    }).join("") + (state.justSaved ? '<span class="saved" role="status">Saved</span>' : "") + '</div></div>';

    html += '<p class="foot" id="bestFoot">' + bestFootText() + '</p>';

    html += pagerHTML(p);
    html += '<p class="foot">App version: ' + APP_VERSION + ' · <a href="privacy.html">Privacy</a> · <a href="about.html">About</a> · <a href="about.html#support">Support this ministry</a></p>';
    elPanel.innerHTML = html;
    if (state.mode === "speak") setSpeakMsg(state.speakMsg, state.speakErr);
    if ((state.mode === "type" || state.mode === "speak") && state.result) renderResult();
    renderPassages();
  }

  /* ---------- typing check ---------- */
  function lev(a, b) {
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  function same(a, b, lenient) {
    if (a === b) return true;
    if (!lenient) return false;
    var L = Math.max(a.length, b.length);
    if (L < 5 || Math.abs(a.length - b.length) > 2) return false;
    return lev(a, b) <= (L >= 9 ? 2 : 1);
  }
  function diff(refWords, typedWords, lenient) {
    var n = refWords.length, m = typedWords.length;
    var rn = refWords.map(function (w) { return norm(w.replace(/-/g, "")); });
    var tn = typedWords.map(function (w) { return norm(w.replace(/-/g, "")); });
    var refSet = {}; rn.forEach(function (w) { refSet[w] = 1; });
    var mergedT = [];
    for (var q = 0; q < typedWords.length; q++) {
      var cur = typedWords[q], nxt = typedWords[q + 1];
      if (nxt !== undefined) {
        var cat = norm((cur + nxt).replace(/-/g, ""));
        if (refSet[cat] && !(refSet[norm(cur)] && refSet[norm(nxt)])) { mergedT.push(cur + nxt); q++; continue; }
      }
      mergedT.push(cur);
    }
    typedWords = mergedT; m = typedWords.length;
    tn = typedWords.map(function (w) { return norm(w.replace(/-/g, "")); });
    var dp = [];
    for (var i = 0; i <= n; i++) { dp.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) {
      dp[i][j] = same(rn[i], tn[j], lenient) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
    var ops = [], a = 0, b = 0, ok = 0, extra = 0;
    while (a < n || b < m) {
      if (a < n && b < m && same(rn[a], tn[b], lenient)) { ops.push({ t: "ok", w: refWords[a] }); ok++; a++; b++; }
      else if (a < n && (b >= m || dp[a + 1][b] >= dp[a][b + 1])) { ops.push({ t: "miss", w: refWords[a] }); a++; }
      else { ops.push({ t: "extra", w: typedWords[b] }); extra++; b++; }
    }
    return { ops: ops, ok: ok, extra: extra, total: n };
  }

  function checkTyped() { checkText(state.typed, false); }
  function bestFootText() {
    var s = progress[state.pid] || {}, bk = state.ver === "KJV" ? "best" : "best_" + state.ver;
    if (s[bk] != null) return "Best recall score (" + state.ver + "): " + s[bk] + "%" + (s.last ? " · last practiced " + new Date(s.last).toLocaleDateString() : "");
    return "Your ratings and scores are saved in this browser.";
  }
  function checkText(text, lenient) {
    var verses = activeVerses();
    var ref = wordsOf(verses).map(function (x) { return x.w; });
    var typed = text.replace(/\d+/g, " ").split(/\s+/).filter(Boolean);
    var d = diff(ref, typed, lenient);
    d.lenient = lenient;
    d.pct = typed.length ? Math.round(100 * d.ok / (d.total + d.extra)) : 0;
    state.result = d;
    var p = passage();
    if (state.verse === null && typed.length) {
      var s = progress[p.id] || {};
      var bk = state.ver === "KJV" ? "best" : "best_" + state.ver;
      if (s[bk] == null || d.pct > s[bk]) s[bk] = d.pct;
      s.last = Date.now();
      progress[p.id] = s; save(progress);
    }
    renderResult();
    var bf = document.getElementById("bestFoot"); if (bf) bf.textContent = bestFootText();
    renderPassages();
  }

  function renderResult() {
    var d = state.result, box = document.getElementById("result");
    if (!box || !d) return;
    var msg = d.pct === 100 ? "Word perfect." : d.pct >= 90 ? "Nearly there." : d.pct >= 60 ? "Good progress." : "Keep at it.";
    box.innerHTML = '<div class="result"><p class="score">' + d.pct + '%<small>' + msg + ' ' + d.ok + ' of ' + d.total + ' words correct.</small></p>' +
      '<div class="diff">' + d.ops.map(function (o) { return '<span class="' + o.t + '">' + esc(o.w) + '</span>'; }).join(" ") + '</div>' +
      '<p class="legend">Highlighted words were missed. Struck-through words were extra or ' + (d.lenient ? 'misheard.' : 'misspelled.') + '</p>' +
      (d.lenient ? '<p class="note">Speech recognition can mishear old words like “hath” or “ye”. If a word was heard wrong, fix it in the text box above and check again. Close misspellings are accepted.</p>' : '') + '</div>';
  }

  /* ---------- events ---------- */
  function resetPractice() {
    stopListening(); state.spoken = ""; state.verse = null; state.revealed = {}; state.typed = ""; state.result = null; state.justSaved = false; state.speakMsg = ""; state.speakErr = false;
  }
  function openUnit(ref, kind, i) {
    var u = unitForRef(ref); if (!u) return;
    resetPractice(); state.pid = u.id; state.screen = "practice"; state.ctx = { mod: state.mod, kind: kind, i: i };
    render(); window.scrollTo(0, 0);
  }
  function openModule(id) {
    resetPractice(); state.view = "course"; state.mod = id || null; state.screen = id ? "module" : "home"; state.ctx = null;
    render(); window.scrollTo(0, 0);
  }
  function setView(v) {
    resetPractice(); state.view = v; state.ctx = null;
    try { localStorage.setItem("kjv-verses-view", v); } catch (er) {}
    if (v === "course") { state.screen = state.mod ? "module" : "home"; }
    else if (v === "favs") { state.screen = "practice"; var fu0 = favUnits(); state.pid = fu0.some(function (u) { return u.id === state.fpid; }) ? state.fpid : (fu0.length ? fu0[0].id : state.pid); }
    else if (v === "days") { state.screen = "practice"; }
    else { state.screen = "practice"; state.pid = state.ppid; }
    render(); window.scrollTo(0, 0);
  }
  document.getElementById("views").addEventListener("click", function (e) {
    var b = e.target.closest("[data-view]"); if (b) setView(b.getAttribute("data-view"));
  });
  function selectPassage(id) {
    if (state.view === "favs") state.fpid = id; else state.ppid = id;
    stopListening(); state.spoken = ""; state.pid = id; state.verse = null; state.revealed = {}; state.typed = ""; state.result = null; state.justSaved = false; state.speakMsg = ""; state.speakErr = false;
    try { localStorage.setItem("kjv-verses-last", state.pid); } catch (er) {}
    render();
    window.scrollTo(0, 0);
  }
  elPassages.addEventListener("click", function (e) {
    var b = e.target.closest(".p-btn"); if (!b) return;
    if (b.hasAttribute("data-mod")) { openModule(b.getAttribute("data-mod")); return; }
    selectPassage(b.getAttribute("data-id"));
  });
  elPanel.addEventListener("change", function (e) {
    if (e.target.id === "verSel") {
      stopListening(); state.ver = e.target.value; state.verse = null; state.revealed = {}; state.result = null; state.spoken = ""; state.typed = ""; state.justSaved = false;
      try { localStorage.setItem("kjv-verses-ver", state.ver); } catch (er) {}
      render();
    }
  });
  document.getElementById("pSel").addEventListener("change", function (e) { if (state.view === "course") openModule(e.target.value); else if (e.target.value) selectPassage(e.target.value); });

  elPanel.addEventListener("click", function (e) {
    var t = e.target;
    var fb = t.closest("#favBtn");
    if (fb) { toggleFav(passage().id); render(); return; }
    var gd = t.closest("[data-due]");
    if (gd) { setView("passages"); selectPassage(gd.getAttribute("data-due")); return; }
    if (t.id === "exportData") { exportData(); return; }
    if (t.id === "clearData") { clearData(); return; }
    if (t.id === "toHome") { openModule(null); return; }
    if (t.id === "backMod") { openModule(state.ctx ? state.ctx.mod : state.mod); return; }
    var rb = t.closest("[data-ref]");
    if (rb) { openUnit(rb.getAttribute("data-ref"), rb.getAttribute("data-kind"), parseInt(rb.getAttribute("data-i"), 10)); return; }
    var mb = t.closest("[data-mod]");
    if (mb) { openModule(mb.getAttribute("data-mod")); return; }
    var nav = t.closest("[data-nav]");
    if (nav) {
      var d = parseInt(nav.getAttribute("data-nav"), 10);
      if (state.view === "course" && state.ctx) { var list = ctxList(), ni2 = state.ctx.i + d; if (list[ni2]) openUnit(list[ni2], state.ctx.kind, ni2); return; }
      if (state.view === "favs") { var fl = favUnits(), fcur = -1; fl.forEach(function (u, j) { if (u.id === state.pid) fcur = j; }); if (fl[fcur + d]) selectPassage(fl[fcur + d].id); return; }
      var ni = PASSAGES.indexOf(passage()) + d; if (PASSAGES[ni]) selectPassage(PASSAGES[ni].id); return;
    }
    var mode = t.closest("[data-mode]");
    if (mode) { stopListening(); state.mode = mode.getAttribute("data-mode"); state.revealed = {}; state.result = null; state.justSaved = false; render(); return; }
    var chip = t.closest("[data-verse]");
    if (chip) { stopListening(); state.spoken = ""; var v = chip.getAttribute("data-verse"); state.verse = v === "all" ? null : parseInt(v, 10); state.revealed = {}; state.typed = ""; state.result = null; render(); return; }
    var w = t.closest(".w");
    if (w) { var k = w.getAttribute("data-k"); if (w.getAttribute("data-hide")) delete state.revealed[k]; else state.revealed[k] = true; refreshScripture(); return; }
    if (t.id === "shuffle") { state.seed = Math.floor(Math.random() * 1e6); state.revealed = {}; refreshScripture(); return; }
    if (t.id === "revealAll") { state.revealed = {}; refreshScripture(); return; }
    if (t.id === "checkBtn") { state.typed = document.getElementById("typed").value; checkTyped(); return; }
    var mic = t.closest("#micBtn");
    if (mic) { if (state.listening) stopListening(); else startListening(); return; }
    if (t.id === "checkSpeak") {
      var wasOn = state.listening; stopListening();
      var runCheck = function () { var sp = document.getElementById("spoken"); if (sp) state.spoken = sp.value; checkText(state.spoken, true); };
      if (wasOn) setTimeout(runCheck, 700); else runCheck();
      return;
    }
    if (t.id === "clearSpeak") { stopListening(); state.spoken = ""; state.result = null; render(); return; }
    if (t.id === "clearBtn") { state.typed = ""; state.result = null; render(); return; }
    var opt = t.closest("[data-level]");
    if (opt) {
      var id = state.pid, s = progress[id] || {}, lvl = parseInt(opt.getAttribute("data-level"), 10);
      s.interval = HidCore.nextInterval(HidCore.intervalOf(s), lvl, !s.level || dueInfo(id).due);
      s.level = lvl; s.last = Date.now();
      progress[id] = s; save(progress); state.justSaved = true; render(); return;
    }
  });

  elPanel.addEventListener("input", function (e) {
    if (e.target.id === "typed") { state.typed = e.target.value; }
    if (e.target.id === "spoken" && !state.listening) { state.spoken = e.target.value; }
    if (e.target.id === "fadeRange") {
      state.fade = parseInt(e.target.value, 10); state.revealed = {};
      document.getElementById("fadeVal").textContent = state.fade + "%";
      e.target.setAttribute("aria-valuetext", state.fade + " percent");
      refreshScripture();
    }
  });
  elPanel.addEventListener("change", function (e) {
    if (e.target.id === "importFile") { importFile(e.target.files && e.target.files[0]); e.target.value = ""; return; }
    if (e.target.id === "hintToggle") { state.typed = document.getElementById("typed").value; state.showHints = e.target.checked; render(); }
  });

  function refreshScripture() {
    var box = document.getElementById("scripture");
    if (box) box.innerHTML = scriptureHTML(activeVerses(), state.mode);
  }

  /* ---------- speech recognition ---------- */
  var rec = null, wantListening = false, baseText = "", sessionText = "", startedAt = 0, gotAny = false, quickEnds = 0;
  // Android sends growing, repeated results ("1", "12", "123" ...), sometimes formatted differently each time.
  // Rebuild the transcript from the whole results list and collapse repeats, comparing words
  // without case, spaces or punctuation.
  function skey(t) { return t.toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function overlapTrim(prev, t) {          // drop words at the start of t that repeat the end of prev (2+ words)
    var lw = prev.split(/\s+/), tw = t.split(/\s+/), maxk = Math.min(lw.length, tw.length);
    for (var k = maxk; k >= 2; k--) {
      if (skey(lw.slice(-k).join(" ")) === skey(tw.slice(0, k).join(" "))) return tw.slice(k).join(" ");
    }
    return t;
  }
  function buildFromResults(results) {
    var segs = [];
    for (var i = 0; i < results.length; i++) {
      var t = (results[i][0].transcript || "").trim();
      if (!t) continue;
      if (segs.length) {
        var last = segs[segs.length - 1], kl = skey(last), kt = skey(t);
        if (kl && kt && kt.indexOf(kl) === 0) { segs[segs.length - 1] = t; continue; }   // t extends last
        if (kl && kt && kl.indexOf(kt) === 0) continue;                                  // t is part of last
        t = overlapTrim(last, t);
        if (!t) continue;
      }
      segs.push(t);
    }
    return segs.join(" ");
  }
  function joinText(base, add) {
    base = base.trim(); add = add.trim();
    if (!base) return add;
    if (!add) return base;
    add = overlapTrim(base, add);
    return add ? base + " " + add : base;
  }
  var DICTATE_TIP = " Tap the box below and use the microphone key on your keyboard to dictate instead, then press Check.";
  function failListening(msg) {
    wantListening = false; state.listening = false; syncMic();
    setSpeakMsg(msg + DICTATE_TIP, true);
    var box = document.getElementById("spoken"); if (box) { box.value = state.spoken; try { box.focus(); } catch (er) {} }
  }
  function setSpeakMsg(msg, isErr) {
    state.speakMsg = msg || ""; state.speakErr = !!isErr;
    var el = document.getElementById("speakMsg");
    if (el) { el.textContent = state.speakMsg; el.className = "speak-msg" + (isErr ? " err" : ""); }
  }
  function syncMic() {
    var b = document.getElementById("micBtn"), l = document.getElementById("micLabel"), t = document.getElementById("spoken");
    if (b) b.setAttribute("aria-pressed", String(state.listening));
    if (l) l.textContent = state.listening ? "Stop" : "Start reciting";
    if (t) t.readOnly = state.listening;
  }
  function startListening() {
    if (!SR) return;
    var t = document.getElementById("spoken");
    baseText = t ? t.value.trim() : state.spoken.trim();
    if (baseText) baseText += " ";
    sessionText = "";
    state.result = null; var rb = document.getElementById("result"); if (rb) rb.innerHTML = "";
    startedAt = Date.now(); gotAny = false; quickEnds = 0;
    try {
      var my = rec = new SR();
      rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true;
      rec.onresult = function (e) {
        if (my !== rec) return;
        gotAny = true; quickEnds = 0;
        sessionText = buildFromResults(e.results);
        state.spoken = joinText(baseText, sessionText);
        var box = document.getElementById("spoken");
        if (box) { box.value = state.spoken; box.scrollTop = box.scrollHeight; }
      };
      rec.onerror = function (e) {
        if (my !== rec) return;
        if (e.error === "no-speech" || e.error === "aborted") return;
        var msg = INSECURE ? FILE_MSG : e.error === "not-allowed" || e.error === "service-not-allowed"
          ? "This page isn’t being allowed to use the microphone (error: " + e.error + "). The page may be blocked from it even if Chrome has permission."
          : e.error === "audio-capture" ? "No microphone was found (error: audio-capture)."
          : e.error === "network" ? "Speech recognition needs an internet connection (error: network)."
          : "Speech recognition stopped (error: " + e.error + ").";
        failListening(msg);
      };
      rec.onend = function () {
        if (my !== rec) return;
        if (wantListening) {
          if (!gotAny && Date.now() - startedAt < 2000) quickEnds++;
          if (quickEnds >= 2) { failListening("Listening kept stopping before hearing anything."); return; }
          startedAt = Date.now();
          var joined = joinText(baseText, sessionText); baseText = joined ? joined + " " : ""; sessionText = "";
          try { rec.start(); return; } catch (er) {}
        }
        state.listening = false; wantListening = false; syncMic();
        var box = document.getElementById("spoken"); if (box) box.value = state.spoken;
        if (!state.speakErr) setSpeakMsg(state.spoken ? "Stopped. Press Check to compare." : "", false);
      };
      wantListening = true; state.listening = true;
      setSpeakMsg("Listening…", false); syncMic();
      rec.start();
    } catch (er) {
      wantListening = false; state.listening = false; syncMic();
      failListening("Couldn’t start the microphone.");
    }
  }
  function stopListening() {
    wantListening = false;
    if (rec && state.listening) { try { rec.stop(); } catch (er) {} }
    state.listening = false; syncMic();
  }

  /* Tabs: arrow keys, Home and End move between tabs and select them (WAI-ARIA tabs pattern). */
  document.addEventListener("keydown", function (e) {
    var tab = e.target.closest && e.target.closest('[role="tab"]'); if (!tab) return;
    var tabs = Array.prototype.slice.call(tab.parentNode.querySelectorAll('[role="tab"]')), i = tabs.indexOf(tab), n = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = tabs.length - 1;
    if (n < 0) return;
    e.preventDefault();
    var key = tabs[n].getAttribute("data-mode") ? '[data-mode="' + tabs[n].getAttribute("data-mode") + '"]' : '[data-view="' + tabs[n].getAttribute("data-view") + '"]';
    tabs[n].click();
    var again = document.querySelector(key); if (again) again.focus();
  });

  /* Text size for Scripture and practice boxes, 80% to 160%. */
  var textSize = loadKey("kjv-verses-textsize", 1);
  if (typeof textSize !== "number" || textSize < 0.8 || textSize > 1.6) textSize = 1;
  function applyTextSize() {
    document.documentElement.style.setProperty("--text-scale", String(textSize));
    var o = document.getElementById("sizeOut"); if (o) o.textContent = Math.round(textSize * 100) + "%";
    var dn = document.getElementById("sizeDown"), up = document.getElementById("sizeUp");
    if (dn) dn.disabled = textSize <= 0.8; if (up) up.disabled = textSize >= 1.6;
  }
  function stepTextSize(d) { textSize = Math.round(Math.min(1.6, Math.max(0.8, textSize + d)) * 10) / 10; saveKey("kjv-verses-textsize", textSize); applyTextSize(); }
  document.getElementById("sizeDown").addEventListener("click", function () { stepTextSize(-0.1); });
  document.getElementById("sizeUp").addEventListener("click", function () { stepTextSize(0.1); });
  applyTextSize();

  document.getElementById("themeBtn").addEventListener("click", function () {
    var cur = document.documentElement.getAttribute("data-theme");
    var isDark = cur ? cur === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("kjv-verses-theme", next); } catch (e) {}
  });

  favs = favs.filter(function (x) { return typeof x === "string"; });
  if (state.view === "favs") { var fu1 = favUnits(); if (fu1.length) { state.pid = fu1[0].id; state.fpid = fu1[0].id; } }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { markDay(1); if (state.view === "days") renderConsistency(); } });
  render();
}

/* ---------- start-up: upgrade stored data, load the text one book at a time, then start ---------- */
(function () {
  "use strict";
  var migration = null;
  try { migration = HidCore.migrateStorage(window.localStorage); } catch (e) {}
  if (migration && migration.newer) {
    document.getElementById("panel").innerHTML = '<h2>Please update</h2><p class="lead">Your progress was saved by a newer version of this app. Reload the page to get the latest version. Your data has not been changed.</p>';
    return;
  }
  Promise.all(HID_TEXT_BOOKS.map(function (b) {
    return fetch("data/text/" + b + ".json").then(function (r) { if (!r.ok) throw new Error(b); return r.json(); });
  })).then(function (parts) {
    var all = {};
    parts.forEach(function (p) { Object.keys(p).forEach(function (id) { all[id] = p[id]; }); });
    startApp(all);
  }).catch(function () {
    document.getElementById("panel").innerHTML = '<h2>Couldn’t load the Bible text</h2><p class="lead">Check your connection and reload. Once the app has loaded once, it works offline.</p>';
  });

  /* Service worker: offline support, and a prompt when a new version is ready (never a silent swap). */
  if (!("serviceWorker" in navigator) || location.protocol.indexOf("http") !== 0) return;
  var updating = false;   // reload only after the person chose to update, never on the first install
  function offer(worker) {
    var bar = document.getElementById("updateBar"), btn = document.getElementById("updateBtn");
    if (!bar || !worker) return;
    bar.hidden = false;
    btn.onclick = function () { btn.disabled = true; updating = true; worker.postMessage({ type: "SKIP_WAITING" }); };
  }
  navigator.serviceWorker.addEventListener("controllerchange", function () { if (!updating) return; updating = false; location.reload(); });
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener("updatefound", function () {
        var w = reg.installing; if (!w) return;
        w.addEventListener("statechange", function () { if (w.state === "installed" && navigator.serviceWorker.controller) offer(w); });
      });
    }).catch(function () {});
  });
})();
