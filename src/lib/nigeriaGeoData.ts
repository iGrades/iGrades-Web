export interface StateData {
  lgas: string[];
  cities: string[];
}

export const NIGERIA_STATES_DATA: Record<string, StateData> = {
  "Abia": {
    lgas: [
      "Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", 
      "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", 
      "Ohafia", "Osisioma Ngwa", "Ugwunagbo", "Ukwa East", "Ukwa West", 
      "Umuahia North", "Umuahia South", "Umunneochi"
    ],
    cities: ["Umuahia", "Aba", "Arochukwu", "Ohafia"]
  },
  "Adamawa": {
    lgas: [
      "Demsa", "Fufore", "Ganye", "Girei", "Gombi", "Guyuk", "Hong", 
      "Jada", "Lamurde", "Madagali", "Maiha", "Mayo-Belwa", "Michika", 
      "Mubi North", "Mubi South", "Numan", "Shelleng", "Song", "Toungo", 
      "Yola North", "Yola South"
    ],
    cities: ["Yola", "Mubi", "Jimeta", "Numan", "Ganye"]
  },
  "Akwa Ibom": {
    lgas: [
      "Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", 
      "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono Ibom", 
      "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", 
      "Mkpat Enin", "Nsit Atai", "Nsit Ibom", "Nsit Ubium", "Obot Akara", 
      "Okobo", "Onna", "Oron", "Oruk Anam", "Udung Uko", "Ukanafun", 
      "Uruan", "Urue-Offong/Oruko", "Uyo"
    ],
    cities: ["Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak"]
  },
  "Anambra": {
    lgas: [
      "Aguata", "Anambra East", "Anambra West", "Anaocha", "Awka North", 
      "Awka South", "Ayamelum", "Dunukofia", "Ekwusigo", "Idemili North", 
      "Idemili South", "Ihiala", "Njikoka", "Nnewi North", "Nnewi South", 
      "Ogbaru", "Onitsha North", "Onitsha South", "Orumba North", "Orumba South", "Oyi"
    ],
    cities: ["Awka", "Onitsha", "Nnewi", "Ekwulobia", "Obosi"]
  },
  "Bauchi": {
    lgas: [
      "Alkaleri", "Bauchi", "Bogoro", "Damban", "Darazo", "Dass", "Gamawa", 
      "Ganjuwa", "Giade", "Itas/Gadau", "Jama'are", "Katagum", "Kirfi", 
      "Misau", "Ningi", "Shira", "Tafawa Balewa", "Toro", "Warji", "Zaki"
    ],
    cities: ["Bauchi", "Azare", "Misau", "Ningi", "Jama'are"]
  },
  "Bayelsa": {
    lgas: [
      "Brass", "Ekeremor", "Kolokuma/Opokuma", "Nembe", "Ogbia", 
      "Sagbama", "Southern Ijaw", "Yenagoa"
    ],
    cities: ["Yenagoa", "Brass", "Ogbia", "Amassoma"]
  },
  "Benue": {
    lgas: [
      "Ado", "Agatu", "Apa", "Buruku", "Gboko", "Guma", "Gwer East", 
      "Gwer West", "Katsina-Ala", "Konshisha", "Kwande", "Logo", "Makurdi", 
      "Obi", "Ogbadibo", "Ohimini", "Oju", "Okpokwu", "Otukpo", "Tarka", 
      "Ukum", "Ushongo", "Vandeikya"
    ],
    cities: ["Makurdi", "Gboko", "Otukpo", "Katsina-Ala"]
  },
  "Borno": {
    lgas: [
      "Abadam", "Askira/Uba", "Bama", "Bayo", "Biu", "Chibok", "Damboa", 
      "Dikwa", "Gubio", "Guzamala", "Gwoza", "Hawul", "Jere", "Kaga", 
      "Kala/Balge", "Konduga", "Kukawa", "Kwaya Kusar", "Mafa", "Magumeri", 
      "Maiduguri", "Marte", "Mobbar", "Monguno", "Ngala", "Nganzai", "Shani"
    ],
    cities: ["Maiduguri", "Biu", "Bama", "Monguno"]
  },
  "Cross River": {
    lgas: [
      "Abi", "Akamkpa", "Akpabuyo", "Bakassi", "Bekwarra", "Biase", "Boki", 
      "Calabar Municipal", "Calabar South", "Etung", "Ikom", "Obanliku", 
      "Obubra", "Obudu", "Odukpani", "Ogoja", "Yakuur", "Yala"
    ],
    cities: ["Calabar", "Ogoja", "Ikom", "Obudu", "Ugep"]
  },
  "Delta": {
    lgas: [
      "Aniocha North", "Aniocha South", "Bomadi", "Burutu", "Ethiope East", 
      "Ethiope West", "Ika North East", "Ika South", "Isoko North", "Isoko South", 
      "Ndokwa East", "Ndokwa West", "Okpe", "Oshimili North", "Oshimili South", 
      "Patani", "Sapele", "Udu", "Ughelli North", "Ughelli South", "Ukwuani", 
      "Uvwie", "Warri North", "Warri South", "Warri South West"
    ],
    cities: ["Asaba", "Warri", "Sapele", "Ughelli", "Agbor"]
  },
  "Ebonyi": {
    lgas: [
      "Abakaliki", "Afikpo North", "Afikpo South", "Ebonyi", "Ezza North", 
      "Ezza South", "Ikwo", "Ishielu", "Ivo", "Izzi", "Ohaozara", "Ohaukwu", "Onicha"
    ],
    cities: ["Abakaliki", "Afikpo", "Onueke"]
  },
  "Edo": {
    lgas: [
      "Akoko-Edo", "Egor", "Esan Central", "Esan North-East", "Esan South-East", 
      "Esan West", "Etsako Central", "Etsako East", "Etsako West", "Igueben", 
      "Ikpoba Okha", "Oredo", "Orhionmwon", "Ovia North-East", "Ovia South-West", 
      "Owan East", "Owan West", "Uhunmwonde"
    ],
    cities: ["Benin City", "Auchi", "Ekpoma", "Uromi"]
  },
  "Ekiti": {
    lgas: [
      "Ado Ekiti", "Efon", "Ekiti East", "Ekiti South West", "Ekiti West", 
      "Emure", "Gbonyin", "Ido Osi", "Ijero", "Ikere", "Ikole", "Ilejemeje", 
      "Irepodun/Ifelodun", "Ise/Orun", "Moba", "Oye"
    ],
    cities: ["Ado-Ekiti", "Ikere", "Oye-Ekiti", "Ijero"]
  },
  "Enugu": {
    lgas: [
      "Aninri", "Awgu", "Enugu East", "Enugu North", "Enugu South", "Ezeagu", 
      "Igbo Etiti", "Igbo Eze North", "Igbo Eze South", "Isi Uzo", "Nkanu East", 
      "Nkanu West", "Nsukka", "Oji River", "Udenu", "Udi", "Uzo-Uwani"
    ],
    cities: ["Enugu", "Nsukka", "Oji River", "Awgu"]
  },
  "FCT": {
    lgas: [
      "Abaji", "Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali"
    ],
    cities: ["Garki", "Wuse", "Maitama", "Gwarinpa", "Asokoro", "Karu", "Kubwa"]
  },
  "Gombe": {
    lgas: [
      "Akko", "Balanga", "Billiri", "Dukku", "Funakaye", "Gombe", "Kaltungo", 
      "Kwami", "Nafada", "Shongom", "Yamaltu/Deba"
    ],
    cities: ["Gombe", "Kaltungo", "Kumo", "Dukku"]
  },
  "Imo": {
    lgas: [
      "Aboh Mbaise", "Ahiazu Mbaise", "Ehime Mbano", "Ezinihitte", "Ideato North", 
      "Ideato South", "Ihitte/Uboma", "Ikeduru", "Isiala Mbano", "Isu", "Mbaitoli", 
      "Ngor Okpala", "Njaba", "Nkwerre", "Nwangele", "Obowo", "Oguta", "Ohaji/Egbema", 
      "Okigwe", "Orlu", "Orsu", "Oru East", "Oru West", "Owerri Municipal", 
      "Owerri North", "Owerri West", "Onuimo"
    ],
    cities: ["Owerri", "Orlu", "Okigwe", "Mbaise"]
  },
  "Jigawa": {
    lgas: [
      "Auyo", "Babura", "Biriniwa", "Birnin Kudu", "Buji", "Dutse", "Gagarawa", 
      "Garki", "Gumel", "Guri", "Gwaram", "Gwiwa", "Hadejia", "Jahun", "Kafin Hausa", 
      "Kaugama", "Kazaure", "Kiri Kasama", "Kiyawa", "Maigatari", "Malam Madori", 
      "Miga", "Ringim", "Roni", "Sule Tankarkar", "Taura", "Yankwashi"
    ],
    cities: ["Dutse", "Hadejia", "Kazaure", "Gumel", "Ringim"]
  },
  "Kaduna": {
    lgas: [
      "Birnin Gwari", "Chikun", "Giwa", "Igabi", "Ikara", "Jaba", "Jema'a", 
      "Kachia", "Kaduna North", "Kaduna South", "Kagarko", "Kajuru", "Kaura", 
      "Kauru", "Kubau", "Kudan", "Lere", "Makarfi", "Sabon Gari", "Sanga", 
      "Soba", "Zangon Kataf", "Zaria"
    ],
    cities: ["Kaduna", "Zaria", "Kafanchan", "Sabon Gari"]
  },
  "Kano": {
    lgas: [
      "Ajingi", "Albasu", "Bagwai", "Bebeji", "Bichi", "Bunkure", "Dala", 
      "Dambatta", "Dawakin Kudu", "Dawakin Tofa", "Doguwa", "Fagge", "Gabasawa", 
      "Garko", "Garun Mallam", "Gaya", "Gezawa", "Gwale", "Gwarzo", "Kabo", 
      "Kano Municipal", "Karaye", "Kibiya", "Kiru", "Kumbotso", "Kunchi", 
      "Kura", "Madobi", "Minjibir", "Nasarawa", "Rano", "Rimin Gado", "Rogo", 
      "Shanono", "Sumaila", "Takai", "Tarauni", "Tofa", "Tsanyawa", "Tudun Wada", 
      "Ungogo", "Warawa", "Wudil"
    ],
    cities: ["Kano", "Bichi", "Wudil", "Gwarzo", "Rano"]
  },
  "Katsina": {
    lgas: [
      "Bakori", "Batagarawa", "Batsari", "Baure", "Bindawa", "Charanchi", 
      "Dandume", "Danja", "Dan Musa", "Daura", "Dutsin Ma", "Faskari", "Funtua", 
      "Ingawa", "Jibia", "Kafur", "Kaita", "Kankara", "Kankia", "Katsina", 
      "Kurfi", "Kusada", "Mai'Adua", "Malumfashi", "Mani", "Mashi", "Sabuwa", 
      "Safana", "Sandamu", "Zango"
    ],
    cities: ["Katsina", "Funtua", "Daura", "Malumfashi"]
  },
  "Kebbi": {
    lgas: [
      "Aleiro", "Arewa Dandi", "Argungu", "Bagudo", "Birnin Kebbi", "Bunza", 
      "Dandi", "Fakai", "Gwandu", "Jega", "Kalgo", "Koko/Besse", "Maiyama", 
      "Ngaski", "Sakaba", "Shanga", "Suru", "Wasagu/Danko", "Yauri", "Zuru"
    ],
    cities: ["Birnin Kebbi", "Argungu", "Zuru", "Yauri", "Jega"]
  },
  "Kogi": {
    lgas: [
      "Adavi", "Ajaokuta", "Ankpa", "Bassa", "Dekina", "Ibaji", "Idah", 
      "Igalamela Odolu", "Ijumu", "Kabba/Bunu", "Kogi", "Lokoja", "Mopa Muro", 
      "Ofu", "Ogori/Magongo", "Okehi", "Okene", "Olamaboro", "Omala", "Yagba East", "Yagba West"
    ],
    cities: ["Lokoja", "Okene", "Idah", "Kabba", "Ankpa"]
  },
  "Kwara": {
    lgas: [
      "Asa", "Baruten", "Edu", "Ekiti", "Ifelodun", "Ilorin East", "Ilorin South", 
      "Ilorin West", "Irepodun", "Isin", "Kaiama", "Moro", "Offa", "Oke Ero", 
      "Oyun", "Pategi"
    ],
    cities: ["Ilorin", "Offa", "Omu-Aran", "Lafiagi"]
  },
  "Lagos": {
    lgas: [
      "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", 
      "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", "Ikeja", 
      "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", "Mushin", 
      "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
    ],
    cities: ["Lagos", "Ikeja", "Lekki", "Victoria Island", "Yaba", "Surulere", "Epe", "Badagry"]
  },
  "Nasarawa": {
    lgas: [
      "Akwanga", "Awe", "Doma", "Karu", "Keana", "Keffi", "Kokona", 
      "Lafia", "Nasarawa", "Nasarawa Egon", "Obi", "Toto", "Wamba"
    ],
    cities: ["Lafia", "Karu", "Keffi", "Akwanga"]
  },
  "Niger": {
    lgas: [
      "Agaie", "Agwara", "Bida", "Borgu", "Bosso", "Chanchaga", "Edati", 
      "Gbako", "Gurara", "Katcha", "Kontagora", "Lapai", "Lavun", "Magama", 
      "Mariga", "Mashegu", "Mokwa", "Munya", "Paikoro", "Rafi", "Rijau", 
      "Shiroro", "Suleja", "Tafa", "Wushishi"
    ],
    cities: ["Minna", "Bida", "Suleja", "Kontagora"]
  },
  "Ogun": {
    lgas: [
      "Abeokuta North", "Abeokuta South", "Ado-Odo/Ota", "Ewekoro", "Ifo", 
      "Ijebu East", "Ijebu North", "Ijebu North East", "Ijebu Ode", "Ikenne", 
      "Imeko Afon", "Ipokia", "Obafemi Owode", "Odeda", "Odogbolu", "Ogun Waterside", 
      "Remo North", "Shagamu", "Yewa North", "Yewa South"
    ],
    cities: ["Abeokuta", "Ota", "Ijebu Ode", "Sagamu", "Ilaro"]
  },
  "Ondo": {
    lgas: [
      "Akoko North-East", "Akoko North-West", "Akoko South-East", "Akoko South-West", 
      "Akure North", "Akure South", "Ese Odo", "Idanre", "Ifedore", "Ilaje", 
      "Ile Oluji/Okeigbo", "Irele", "Odigbo", "Okitipupa", "Ondo East", "Ondo West", 
      "Ose", "Owo"
    ],
    cities: ["Akure", "Ondo Town", "Owo", "Okitipupa", "Ikare"]
  },
  "Osun": {
    lgas: [
      "Atakunmosa East", "Atakunmosa West", "Ayedaade", "Ayedire", "Boluwaduro", 
      "Boripe", "Ede North", "Ede South", "Egbedore", "Ejigbo", "Ife Central", 
      "Ife East", "Ife North", "Ife South", "Ifedayo", "Ifelodun", "Ila Orangun", 
      "Ilesa East", "Ilesa West", "Irepodun", "Irewole", "Isokan", "Iwo", "Obokun", 
      "Odo Otin", "Ola Oluwa", "Olorunda", "Oriade", "Orolu", "Osogbo"
    ],
    cities: ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Iwo"]
  },
  "Oyo": {
    lgas: [
      "Afijio", "Akinyele", "Atiba", "Atisbo", "Egbeda", "Ibadan North", 
      "Ibadan North-East", "Ibadan North-West", "Ibadan South-East", "Ibadan South-West", 
      "Ibarapa Central", "Ibarapa East", "Ibarapa North", "Ido", "Irepo", 
      "Itesiwaju", "Iwajowa", "Kajola", "Lagelu", "Ogbomosho North", "Ogbomosho South", 
      "Ogo Oluwa", "Olorunsogo", "Oluyole", "Ona Ara", "Orelope", "Ori Ire", 
      "Oyo East", "Oyo West", "Saki East", "Saki West", "Surulere"
    ],
    cities: ["Ibadan", "Ogbomosho", "Oyo Town", "Saki", "Iseyin"]
  },
  "Plateau": {
    lgas: [
      "Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South", 
      "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang", 
      "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase"
    ],
    cities: ["Jos", "Mangu", "Bukuru", "Pankshin"]
  },
  "Rivers": {
    lgas: [
      "Abua/Odual", "Ahoada East", "Ahoada West", "Akuku-Toru", "Andoni", 
      "Asari-Toru", "Bonny", "Degema", "Eleme", "Emohua", "Etche", "Gokana", 
      "Ikwerre", "Oyigbo", "Khana", "Obio/Akpor", "Ogba/Egbema/Ndoni", 
      "Ogu/Bolo", "Okrika", "Omuma", "Opobo/Nkoro", "Port Harcourt", "Tai"
    ],
    cities: ["Port Harcourt", "Bonny", "Oyigbo", "Ahoada"]
  },
  "Sokoto": {
    lgas: [
      "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", 
      "Gwadabawa", "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", 
      "Shagari", "Silame", "Sokoto North", "Sokoto South", "Tambuwal", 
      "Tangaza", "Tureta", "Wamako", "Wurno", "Yabo"
    ],
    cities: ["Sokoto", "Wamako", "Tambuwal"]
  },
  "Taraba": {
    lgas: [
      "Ardo Kola", "Bali", "Donga", "Gashaka", "Gassol", "Ibi", "Jalingo", 
      "Karim Lamido", "Kurmi", "Lau", "Sardauna", "Takum", "Ussa", "Wukari", 
      "Yorro", "Zing"
    ],
    cities: ["Jalingo", "Wukari", "Takum", "Bali"]
  },
  "Yobe": {
    lgas: [
      "Bade", "Bursari", "Damaturu", "Fika", "Fune", "Geidam", "Gujba", 
      "Gulani", "Jakusko", "Karasuwa", "Machina", "Nangere", "Nguru", 
      "Potiskum", "Tarmuwa", "Yunusari", "Yusufari"
    ],
    cities: ["Damaturu", "Potiskum", "Nguru", "Gashua"]
  },
  "Zamfara": {
    lgas: [
      "Anka", "Bakura", "Birnin Magaji/Kiyaw", "Bukkuyum", "Bungudu", 
      "Gummi", "Gusau", "Kaura Namoda", "Maradun", "Maru", "Shinkafi", 
      "Talata Mafara", "Chafe", "Zurmi"
    ],
    cities: ["Gusau", "Kaura Namoda", "Talata Mafara", "Shinkafi"]
  }
};
