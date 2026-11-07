// Firebase 웹 앱 설정입니다.
// 이 값들은 "어느 Firebase 프로젝트에 연결할지"를 알려 주는 공개 식별 정보이며 비밀번호가 아닙니다.
// 실제 데이터 보호는 firestore.rules(본인 일기만 읽기/쓰기)와 Authentication 승인 도메인이 담당합니다.
// 개인정보 보호를 위해 Google Analytics(measurementId)는 일부러 넣지 않았습니다.
// 이 값을 null로 바꾸면 일기장은 로그인 없이 "이 기기에 저장" 모드로만 동작합니다.
export const firebaseConfig = {
  apiKey: "AIzaSyA0lDLnaYZrc7azwzebJd0pel3LpUeVktE",
  authDomain: "diary-6d726.firebaseapp.com",
  projectId: "diary-6d726",
  storageBucket: "diary-6d726.firebasestorage.app",
  messagingSenderId: "339662366938",
  appId: "1:339662366938:web:70b66e16e710c7d9a89de3"
};
