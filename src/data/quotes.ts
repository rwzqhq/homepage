export interface Quote {
  text: string;
  author: string;
}

/** Classical Chinese lines — all in the public domain. */
export const QUOTES: Quote[] = [
  { text: '欲买桂花同载酒，终不似，少年游。', author: '唐多令·芦叶满汀洲' },
  { text: '两情若是久长时，又岂在朝朝暮暮。', author: '鹊桥仙·纤云弄巧' },
  { text: '莫等闲，白了少年头，空悲切。', author: '满江红·写怀' },
  { text: '人生若只如初见，何事秋风悲画扇。', author: '木兰花·拟古决绝词' },
  { text: '问世间，情为何物，直教生死相许？', author: '摸鱼儿·雁丘词' },
  { text: '今宵剩把银釭照，犹恐相逢是梦中。', author: '鹧鸪天·彩袖殷勤捧玉钟' },
  { text: '明月楼高休独倚，酒入愁肠，化作相思泪。', author: '苏幕遮·怀旧' },
  { text: '多情自古伤离别，更那堪，冷落清秋节！。', author: '雨霖铃·寒蝉凄切' },
  { text: '物是人非事事休，欲语泪先流。', author: '武陵春·春晚' },
  { text: '此情无计可消除，才下眉头，却上心头。', author: '一剪梅·红藕香残玉簟秋' },
  { text: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。', author: '声声慢·寻寻觅觅' },
  { text: '被酒莫惊春睡重，赌书消得泼茶香。当时只道是寻常。', author: '浣溪沙·谁念西风独自凉' },
  { text: '千古兴亡多少事？悠悠。不尽长江滚滚流。', author: '南乡子·登京口北固亭有怀' },
  { text: '兴，百姓苦；亡，百姓苦。', author: '山坡羊·潼关怀古' },
  { text: '凭谁问：廉颇老矣，尚能饭否？', author: '永遇乐·京口北固亭怀古' },
  { text: '众里寻他千百度。蓦然回首，那人却在，灯火阑珊处。', author: '青玉案·元夕' },
  { text: '回首向来萧瑟处，归去，也无风雨也无晴。', author: '定风波·莫听穿林打叶声' },
  { text: '料得年年肠断处，明月夜，短松冈。', author: '江城子·乙卯正月二十日夜记梦' },
  { text: '人有悲欢离合，月有阴晴圆缺，此事古难全。', author: '水调歌头·明月几时有' },
  { text: '故国神游，多情应笑我，早生华发。', author: '念奴娇·赤壁怀古' },
  { text: '梦里不知身是客，一晌贪欢。', author: '浪淘沙令·帘外雨潺潺' },
  { text: '世事漫随流水，算来一梦浮生。', author: '乌夜啼·昨夜风兼雨' },
  { text: '剪不断，理还乱，是离愁。别是一般滋味在心头。', author: '相见欢·无言独上西楼' },
  { text: '问君能有几多愁？恰似一江春水向东流。', author: '虞美人·春花秋月何时了' },
  { text: '侯门一入深似海，从此萧郎是路人。', author: '赠去婢' },
  { text: '数声风笛离亭晚，君向潇湘我向秦。', author: '淮上与友人别' },
  { text: '江畔何人初见月？江月何年初照人？', author: '春江花月夜' },
  { text: '此情可待成追忆？只是当时已惘然。', author: '锦瑟' },
  { text: '从此无心爱良夜，任他明月下西楼。', author: '写情' },
  { text: '昨日看花花灼灼，今朝看花花欲落。', author: '惜花吟' },
  { text: '我来问道无余说，云在青天水在瓶。', author: '赠药山高僧惟俨二首·其一' },
  { text: '其政闷闷，其民淳淳；其政察察，其民缺缺。', author: '道德经' },
  { text: '花红易衰似郎意，水流无限似侬愁。', author: '竹枝词·山桃红花满上头' },

];

export function randomQuoteIndex(exclude = -1): number {
  if (QUOTES.length <= 1) return 0;
  let index = exclude;
  while (index === exclude) {
    index = Math.floor(Math.random() * QUOTES.length);
  }
  return index;
}
