# 작은 앱 서랍 (webapp-hub)

바이브 코딩으로 만드는 작은 웹앱들을 모아 두는 허브입니다. 빌드 과정 없이 HTML·CSS·JS만으로 동작하며 GitHub Pages로 배포됩니다.

- 허브: `index.html` — 앱 목록은 `assets/apps.js`에서 관리
- 앱 1: **하루 일기장** (`apps/diary/`)

## 하루 일기장

- 로그인하지 않으면 일기를 **이 브라우저(localStorage)** 에만 저장합니다.
- **Google 로그인** 시 Firebase Firestore의 `users/{내 uid}/entries`에 저장되어 다른 기기에서도 이어 쓸 수 있습니다.
- 로그인하면 이 기기에만 있던 일기를 계정으로 옮길 수 있습니다.

### 보안·개인정보 설계

| 항목 | 처리 |
| --- | --- |
| Firebase 웹 설정(`firebase-config.js`) | 공개 식별값입니다(비밀 키 아님). 보호는 아래 규칙과 승인 도메인이 담당합니다. |
| 데이터 접근 | `firestore.rules`: 본인 uid 경로만 읽기/쓰기, 필드·길이 검증, 나머지 경로 전부 차단 |
| 로그인 허용 도메인 | Firebase Authentication 승인 도메인에 GitHub Pages 주소만 추가 |
| 분석·추적 | Google Analytics 등 추적 코드 없음 |
| 화면 출력 | 사용자 입력은 `textContent`로만 출력(XSS 방지) |
| 저장소에 올리지 않는 것 | 서비스 계정 키, `.env`, 로그 등 (`.gitignore`) |

> 학생 실명·연락처 등 민감한 개인정보는 일기에 적지 않도록 안내해 주세요. 일기는 Firebase(Google Cloud)에 저장됩니다.

## 새 앱 추가하기

1. `apps/<앱이름>/index.html` 폴더를 만듭니다.
2. `assets/apps.js`의 `HUB_APPS` 배열에 항목을 추가합니다.
3. 커밋·푸시하면 GitHub Pages에 자동 반영됩니다.

## 로컬에서 보기

ES 모듈을 쓰므로 파일을 더블클릭하지 말고 간단한 정적 서버로 여세요(예: VS Code Live Server).
