import { v } from "convex/values"
import { internalMutation } from "./_generated/server"
import { startGameHelper, submitAnswerHelper } from "./game"

const TAYLOR_SWIFT_SONGS_QUIZ = {
  answers: [
    ["Tim McGraw", "tim mcgraw"],
    ["Teardrops on My Guitar", "teardrops on my guitar"],
    ["Picture to Burn", "picture to burn"],
    ["A Place In This World", "a place in this world"],
    ["Cold As You", "cold as you"],
    ["The Outside", "the outside"],
    [
      "Tied Together With A Smile",
      "tied together with a smile",
    ],
    ["Stay Beautiful", "stay beautiful"],
    ["Should've Said No", "should've said no"],
    ["Mary's Song", "mary's song"],
    ["Our Song", "our song"],
    ["Fearless", "fearless"],
    ["Fifteen", "fifteen"],
    ["Love Story", "love story"],
    ["Hey Stephen", "hey stephen"],
    ["White Horse", "white horse"],
    ["You Belong With Me", "you belong with me"],
    ["Breathe", "breathe"],
    ["Tell Me Why", "tell me why"],
    ["You're Not Sorry", "you're not sorry"],
    ["The Way I Loved You", "the way i loved you"],
    ["Forever and Always", "forever and always"],
    ["The Best Day", "the best day"],
    ["Change", "change"],
    ["Mine", "mine"],
    ["Sparks Fly", "sparks fly"],
    ["Back To December", "back to december"],
    ["Speak Now", "speak now"],
    ["Dear John", "dear john"],
    ["Mean", "mean"],
    ["The Story of Us", "the story of us"],
    ["Never Grow Up", "never grow up"],
    ["Enchanted", "enchanted"],
    ["Better Than Revenge", "better than revenge"],
    ["Innocent", "innocent"],
    ["Haunted", "haunted"],
    ["Last Kiss", "last kiss"],
    ["Long Live", "long live"],
    ["State of Grace", "state of grace"],
    ["Red", "red"],
    ["Treacherous", "treacherous"],
    [
      "I Knew You Were Trouble.",
      "i knew you were trouble.",
    ],
    ["All Too Well", "all too well"],
    ["22"],
    ["I Almost Do", "i almost do"],
    [
      "We Are Never Ever Getting Back Together",
      "we are never ever getting back together",
    ],
    ["Stay Stay Stay", "stay stay stay"],
    ["The Last Time", "the last time"],
    ["Holy Ground", "holy ground"],
    ["Sad Beautiful Tragic", "sad beautiful tragic"],
    ["The Lucky One", "the lucky one"],
    ["Everything Has Changed", "everything has changed"],
    ["Starlight", "starlight"],
    ["Begin Again", "begin again"],
    ["Welcome to New York", "welcome to new york"],
    ["Blank Space", "blank space"],
    ["Style", "style"],
    ["Out of the Woods", "out of the woods"],
    [
      "All You Had to Do Was Stay",
      "all you had to do was stay",
    ],
    ["Shake it Off", "shake it off"],
    ["I Wish You Would", "i wish you would"],
    ["Bad Blood", "bad blood"],
    ["Wildest Dreams", "wildest dreams"],
    ["How You Get the Girl", "how you get the girl"],
    ["This Love", "this love"],
    ["I Know Places", "i know places"],
    ["Clean", "clean"],
    [
      "...Ready for It?",
      "...ready for it?",
      "ready for it",
    ],
    ["End Game", "end game"],
    ["I Did Something Bad", "i did something bad"],
    ["Don't Blame Me", "don't blame me"],
    ["Delicate", "delicate"],
    [
      "Look What You Made Me Do",
      "look what you made me do",
    ],
    ["So It Goes...", "so it goes", "so it goes..."],
    ["Gorgeous ", "gorgeous "],
    ["Getaway Car", "getaway car"],
    ["King of My Heart", "king of my heart"],
    [
      "Dancing with Our Hands Tied",
      "dancing with our hands tied",
    ],
    ["Dress", "dress"],
    [
      "This Is Why We Can't Have Nice Things",
      "this is why we can't have nice things",
    ],
    ["Call It What You Want", "call it what you want"],
    ["New Year's Day", "new year's day"],
    [
      "I Forgot That You Existed",
      "i forgot that you existed",
    ],
    ["Cruel Summer", "cruel summer"],
    ["Lover", "lover"],
    ["The Man", "the man"],
    ["The Archer", "the archer"],
    ["I Think He Knows", "i think he knows"],
    [
      "Miss Americana & the Heartbreak Prince",
      "miss americana & the heartbreak prince",
    ],
    ["Paper Rings", "paper rings"],
    ["Cornelia Street", "cornelia street"],
    [
      "Death by a Thousand Cuts",
      "death by a thousand cuts",
    ],
    ["London Boy", "london boy"],
    ["Soon You'll Get Better", "soon you'll get better"],
    ["False God", "false god"],
    ["You Need to Calm Down", "you need to calm down"],
    ["Afterglow", "afterglow"],
    ["Me!", "me!"],
    [
      "It's Nice to Have a Friend",
      "it's nice to have a friend",
    ],
    ["Daylight", "daylight"],
    ["The 1", "the 1", "the one"],
    ["Cardigan", "cardigan"],
    [
      "The Last Great American Dynasty",
      "the last great american dynasty",
    ],
    ["Exile", "exile"],
    ["My Tears Ricochet", "my tears ricochet"],
    ["Mirrorball", "mirrorball"],
    ["7", "Seven", "seven"],
    ["August", "august"],
    ["This Is Me Trying", "this is me trying"],
    ["Illicit Affairs", "illicit affairs"],
    ["Invisible String", "invisible string"],
    ["Mad Woman", "mad woman"],
    ["Epiphany", "epiphany"],
    ["Betty", "betty"],
    ["Peace", "peace"],
    ["Hoax", "hoax"],
    ["Willow", "willow"],
    ["Champagne Problems", "champagne problems"],
    ["Gold Rush", "gold rush"],
    ["Tis the Damn Season", "tis the damn season"],
    ["Tolerate It", "tolerate it"],
    ["No Body, No Crime", "no body, no crime"],
    ["Happiness", "happiness"],
    ["Dorothea", "dorothea"],
    ["Coney Island", "coney island"],
    ["Ivy", "ivy"],
    ["Cowboy like Me", "cowboy like me"],
    ["Long Story Short", "long story short"],
    ["Marjorie", "marjorie"],
    ["Closure", "closure"],
    ["Evermore", "evermore"],
    ["Lavender Haze", "lavender haze"],
    ["Maroon", "maroon"],
    ["Anti-Hero", "anti-hero"],
    ["Snow on the Beach", "snow on the beach"],
    ["You're on Your Own, Kid", "you're on your own, kid"],
    ["Midnight Rain", "midnight rain"],
    ["Question...?", "question...?"],
    ["Vigilante Sh**", "vigilante sh**", "vigilante shit"],
    ["Bejeweled", "bejeweled"],
    ["Labyrinth", "labyrinth"],
    ["Karma", "karma"],
    ["Sweet Nothing", "sweet nothing"],
    ["Mastermind", "mastermind"],
  ],
  charMap:
    '{"0":"(","1":"e","2":"^","3":"j","4":"=","5":"#","6":"{","7":"s","8":"E","9":"S","O":")","^":"~","v":"<","Q":"h","$":"I","T":"%","D":"O","B":"[",">":"y","_":"w","*":"J","j":"X","x":"n","m":"&","l":"d","s":"l","N":"0","%":"$","d":"*","o":"_","L":"Q","a":"a","n":"v","k":"2","f":"@","X":"N","G":"r","=":"B","c":"m","}":"Z","y":"]","I":"G","h":"4","P":"U","J":"3","S":"b","{":"g","[":"D"," ":"P","p":"z","U":"R","A":"o","q":"}","Y":"t","e":"u","K":"F","Z":"q","(":"7","M":"i","W":"Y","w":"C","&":"A","#":"p","R":"K","t":"c","u":"1","+":"5","F":">","~":"W","r":"M","@":"6","]":" ","i":"H","V":"8","C":"f","E":"k",")":"+","z":"x","g":"V","H":"T","<":"9","b":"L"}',
  obfuscatedAnswers: [
    "%4HlPGlPY4]PYuPfav'cPTa<uP0HmuP%4HvVl",
    "%4HlPGlPiuP%M]HvV",
    "%4HlPQ_<u",
    "%4uP)1clH*u",
    "%4uPQ1m2]P)vu",
    "%4uPQalcP%H&u",
    "%4uPQalcPrMuacPo&uMHmavPO]valc]",
    "%4uPYa]PGPQ_<u*Pt_1",
    "%4uP[ulcPOa]",
    "%4uPbc_M]P_@PRl",
    "%4uPe",
    "%4uPiav",
    "%4uPoMm4uM",
    "%H&PimrMaC",
    "%HlPc4uPOa&vPbual_v",
    "%Hu*P%_Vuc4uMPYHc4PoPb&Hdu",
    "%Muam4uM_1l",
    "%_duMacuPGc",
    "%uaM*M_zlP_vPi]Pr1HcaM",
    "%uddPiuPY4]",
    "&H*vHV4cPMaHv",
    "&HMM_MLadd",
    "&HllPa&uMHmavaPAPc4uP4uaMcLMua2PzMHvmu",
    "&Hvu",
    "&]PcuaMlPMHm_m4uc",
    "&a*PC_&av",
    "&aMX_MHu",
    "&aM]'lPl_vV",
    "&aM__v",
    "&alcuM&Hv*",
    "&u!",
    "&uav",
    ")1MPb_vV",
    ")1cP_@Pc4uPY__*l",
    "*Mull",
    "*_M_c4ua",
    "*_v'cPLda&uP&u",
    "*a]dHV4c",
    "*avmHvVPCHc4P_1MP4av*lPcHu*",
    "*uaMPX_4v",
    "*uac4PL]PaPc4_1lav*Pm1cl",
    "*udHmacu",
    "...Kua*]P@_MPGc?",
    "...Mua*]P@_MPHc?",
    "0_P[_*],P0_PfMH&u",
    "0u<uMPrM_CPRz",
    "0uCPtuaM'lPOa]",
    "2HvVP_@P&]P4uaMc",
    "2aM&a",
    "4_CP]_1PVucPc4uPVHMd",
    "4_an",
    "4_d]PVM_1v*",
    "4a1vcu*",
    "4azzHvull",
    "4u]Plcuz4uv",
    "8HVHdavcuPb4JJ",
    "<HVHdavcuPl4Hc",
    "<HVHdavcuPl4JJ",
    ">H@cuuv",
    ">_Mu<uMPav*PodCa]l",
    ">adluPr_*",
    ">uaMdull",
    "@H@cuuv",
    "@_Mu<uMPav*PadCa]l",
    "@adluPV_*",
    "@uaMdull",
    "C4HcuP4_Mlu",
    "CHd*ulcP*Mua&l",
    "CHdd_C",
    "CuPaMuPvu<uMPu<uMPVuccHvVPLam2Pc_Vuc4uM",
    "Cudm_&uPc_PvuCP]_M2",
    "FHvVP_@Pi]PTuaMc",
    "FaM&a",
    "G<]",
    "GP%4Hv2PTuPFv_Cl",
    "GP>_MV_cP%4acPt_1PknHlcu*",
    "GPFv_CPUdamul",
    "GPFvuCPt_1PYuMuP%M_1Ldu.",
    "GPOH*Pb_&uc4HvVP[a*",
    "GPYHl4Pt_1PY_1d*",
    "GPod&_lcPO_",
    "Gc'lP0HmuPc_PTa<uPaP>MHuv*",
    "GddHmHcPo@@aHMl",
    "Gv<HlHLduPbcMHvV",
    "Gvv_muvc",
    "H<]",
    "HP*H*Pl_&uc4HvVPLa*",
    "HP2v_CPzdamul",
    "HP2vuCP]_1PCuMuPcM_1Ldu.",
    "HP@_MV_cPc4acP]_1PunHlcu*",
    "HPCHl4P]_1PC_1d*",
    "HPad&_lcP*_",
    "HPc4Hv2P4uP2v_Cl",
    "Hc'lPvHmuPc_P4a<uPaP@MHuv*",
    "HddHmHcPa@@aHMl",
    "Hv<HlHLduPlcMHvV",
    "Hvv_muvc",
    "Ku*",
    "LMuac4u",
    "La*PLd__*",
    "Lam2Pc_P*umu&LuM",
    "Ldav2Plzamu",
    "LuVHvPaVaHv",
    "LuXuCudu*",
    "Lucc]",
    "LuccuMPc4avPMu<uvVu",
    "Mu*",
    "Mua*]P@_MPHc",
    "OMull",
    "O_M_c4ua",
    "O_v'cP[da&uPiu",
    "Oa]dHV4c",
    "OavmHvVPCHc4P)1MPTav*lP%Hu*",
    "OuaMP3_4v",
    "Ouac4PL]PaP%4_1lav*Pf1cl",
    "OudHmacu",
    "Q_<uM",
    "Q_<uPbc_M]",
    "Q__2PY4acPt_1Pia*uPiuPO_",
    "Q_v*_vP[_]",
    "Q_vVPQH<u",
    "Q_vVPbc_M]Pb4_Mc",
    "Qa<uv*uMPTaxu",
    "QaL]MHvc4",
    "QalcPFHll",
    "T_CPt_1PrucPc4uPrHMd",
    "T_an",
    "T_d]PrM_1v*",
    "Ta1vcu*",
    "TazzHvull",
    "Tu]Pbcuz4uv",
    "UHmc1MuPc_P[1Mv",
    "UazuMPKHvVl",
    "Uuamu",
    "V_MVu_1lP",
    "V_d*PM1l4",
    "VucaCa]PmaM",
    "Y4HcuPT_Mlu",
    "YHd*ulcPOMua&l",
    "YHdd_C",
    "YuPoMuP0u<uMPk<uMPruccHvVP[am2P%_Vuc4uM",
    "Yudm_&uPc_P0uCPt_M2",
    "[Muac4u",
    "[a*P[d__*",
    "[am2P%_POumu&LuM",
    "[dav2Pbzamu",
    "[uVHvPoVaHv",
    "[uXuCudu*",
    "[ucc]",
    "[uccuMP%4avPKu<uvVu",
    "]_1'MuP_vP]_1MP_Cv,P2H*",
    "]_1'MuPv_cPl_MM]",
    "]_1PLud_vVPCHc4P&u",
    "]_1Pvuu*Pc_Pmad&P*_Cv",
    "^^",
    "_1MPl_vV",
    "_1cP_@Pc4uPC__*l",
    "a1V1lc",
    "a@cuMVd_C",
    "aPzdamuPHvPc4HlPC_Md*",
    "addP]_1P4a*Pc_P*_PCalPlca]",
    "addPc__PCudd",
    "avcH-4uM_",
    "b4_1d*'<uPbaH*P0_",
    "b4a2uPHcP)@@",
    "bCuucP0_c4HvV",
    "b_PGcPr_ul...",
    "b__vPt_1'ddPrucP[uccuM",
    "ba*P[ua1cH@1dP%MaVHm",
    "bc]du",
    "bcaMdHV4c",
    "bca]P[ua1cH@1d",
    "bca]Pbca]Pbca]",
    "bcacuP_@PrMamu",
    "bu<uv",
    "bv_CP_vPc4uP[uam4",
    "bzaM2lP>d]",
    "bzua2P0_C",
    "c4HlPHlP&uPcM]HvV",
    "c4HlPHlPC4]PCuPmav'cP4a<uPvHmuPc4HvVl",
    "c4HlPd_<u",
    "c4uP&av",
    "c4uPCa]PHPd_<u*P]_1",
    "c4uPLulcP*a]",
    "c4uP_1clH*u",
    "c4uP_vu",
    "c4uPaMm4uM",
    "c4uPd1m2]P_vu",
    "c4uPdalcPVMuacPa&uMHmavP*]valc]",
    "c4uPdalcPcH&u",
    "c4uPe",
    "c4uPlc_M]P_@P1l",
    "cH&P&mVMaC",
    "cHlPc4uP*a&vPlual_v",
    "cHu*Pc_Vuc4uMPCHc4PaPl&Hdu",
    "cMuam4uM_1l",
    "c_duMacuPHc",
    "cuaM*M_zlP_vP&]PV1HcaM",
    "cuddP&uPC4]",
    "d_<uM",
    "d_<uPlc_M]",
    "d__2PC4acP]_1P&a*uP&uP*_",
    "d_v*_vPL_]",
    "d_vVPdH<u",
    "d_vVPlc_M]Pl4_Mc",
    "da<uv*uMP4axu",
    "daL]MHvc4",
    "dalcP2Hll",
    "f4a&zaVvuPUM_Ldu&l",
    "f4avVu",
    "fM1udPb1&&uM",
    "f_CL_]PdH2uPiu",
    "f_MvudHaPbcMuuc",
    "f_d*PolPt_1",
    "f_vu]PGldav*",
    "faM*HVav",
    "faddPGcPY4acPt_1PYavc",
    "fd_l1Mu",
    "fduav",
    "h1ulcH_v...?",
    "iH*vHV4cPKaHv",
    "iHMM_MLadd",
    "iHllPo&uMHmavaPAPc4uPTuaMcLMua2PUMHvmu",
    "iHvu",
    "i]P%uaMlPKHm_m4uc",
    "ia*PY_&av",
    "iaMX_MHu",
    "iaM]'lPb_vV",
    "iaM__v",
    "ialcuM&Hv*",
    "iu!",
    "iuav",
    "k<uM&_Mu",
    "k<uM]c4HvVPTalPf4avVu*",
    "knHdu",
    "kv*Pra&u",
    "kvm4avcu*",
    "kzHz4av]",
    "l4_1d*'<uPlaH*Pv_",
    "l4a2uPHcP_@@",
    "lCuucPv_c4HvV",
    "l_PHcPV_ul",
    "l_PHcPV_ul...",
    "l__vP]_1'ddPVucPLuccuM",
    "la*PLua1cH@1dPcMaVHm",
    "lc]du",
    "lcaMdHV4c",
    "lca]PLua1cH@1d",
    "lca]Plca]Plca]",
    "lcacuP_@PVMamu",
    "lu<uv",
    "lv_CP_vPc4uPLuam4",
    "lzaM2lP@d]",
    "lzua2Pv_C",
    "m4a&zaVvuPzM_Ldu&l",
    "m4avVu",
    "mM1udPl1&&uM",
    "m_CL_]PdH2uP&u",
    "m_MvudHaPlcMuuc",
    "m_d*PalP]_1",
    "m_vu]PHldav*",
    "maM*HVav",
    "maddPHcPC4acP]_1PCavc",
    "md_l1Mu",
    "mduav",
    "o1V1lc",
    "o@cuMVd_C",
    "oPUdamuPGvP%4HlPY_Md*",
    "oddP%__PYudd",
    "oddPt_1PTa*Pc_PO_PYalPbca]",
    "ovcH-TuM_",
    "r_MVu_1lP",
    "r_d*PK1l4",
    "rucaCa]PfaM",
    "s",
    "t_1'MuP0_cPb_MM]",
    "t_1'MuP_vPt_1MP)Cv,PFH*",
    "t_1P0uu*Pc_Pfad&PO_Cv",
    "t_1P[ud_vVPYHc4Piu",
    "u<uM&_Mu",
    "u<uM]c4HvVP4alPm4avVu*",
    "unHdu",
    "uv*PVa&u",
    "uvm4avcu*",
    "uzHz4av]",
    "v_PL_*],Pv_PmMH&u",
    "vu<uMPVM_CP1z",
    "vuCP]uaM'lP*a]",
    "zHmc1MuPc_PL1Mv",
    "zazuMPMHvVl",
    "zuamu",
    "}1ulcH_v...?",
  ],
  sporcleUrl:
    "https://www.sporcle.com/games/chasing_destiny/tswiftallsongs",
  title: "Taylor Swift Songs Quiz",
}

export default internalMutation({
    handler: async (
      { db },
    ) => {
      const quizId = await db.insert('quiz', TAYLOR_SWIFT_SONGS_QUIZ)
      const playerId = await db.insert("sessions", {
        color: "#2ecc71",
        name: "User 1234"
      });
      const player = (await db.get(playerId))!;
      const gameId = await startGameHelper(db, player, quizId)
      await db.patch(gameId, {
        isPublic: true,
      })
      await submitAnswerHelper(db, player, gameId, "Tim McGraw")
    },
  })