// 허브에 표시할 앱 목록입니다. 새 앱을 만들면 여기에 항목을 하나 추가하세요.
// status: "live"(사용 가능) | "beta"(시험 중) | "planned"(준비 중)
window.HUB_APPS = [
  {
    id: "diary",
    name: "하루 일기장",
    emoji: "📔",
    description: "오늘의 기분과 하루를 기록하는 일기장. 로그인 없이 이 기기에 저장하거나, Google 로그인으로 어디서든 이어 쓸 수 있어요.",
    path: "apps/diary/",
    status: "live",
    tags: ["기록", "Firebase", "Google 로그인"],
    color: "#e07a5f"
  },
  {
    id: "next",
    name: "다음 앱",
    emoji: "🧪",
    description: "다음 바이브 코딩 작품이 들어올 자리입니다.",
    path: "",
    status: "planned",
    tags: ["준비 중"],
    color: "#81b29a"
  }
];
