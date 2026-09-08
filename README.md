# 탈모 디펜스 : 이상연의 마지막 한 올

정적 웹게임 프로젝트입니다. 서버 코드나 빌드 과정이 필요 없습니다.

## 파일 구조

```text
hair-loss-defense/
├─ index.html
├─ style.css
├─ game.js
├─ .nojekyll
└─ assets/
   └─ intro/
      ├─ intro1.jpg
      ├─ intro2.png
      ├─ intro3.jpg
      └─ intro4.jpg
```

## 로컬 테스트

폴더 안의 `index.html`을 열어도 되지만, 브라우저 보안 설정에 따라 로컬 파일의 동작이 달라질 수 있으므로 간단한 로컬 서버 테스트를 권장합니다.

Python이 설치되어 있다면 폴더에서:

```bash
python -m http.server 8000
```

그 다음 `http://localhost:8000`으로 접속합니다.

## GitHub Pages

1. 이 폴더 안의 파일을 GitHub 저장소 루트에 업로드합니다.
2. 저장소 Settings → Pages로 이동합니다.
3. Deploy from a branch를 선택합니다.
4. `main` 브랜치와 `/ (root)`를 선택해 저장합니다.
5. 생성된 Pages 주소를 친구들에게 보내면 됩니다.

## 다른 배포 Dashboard

Netlify, Vercel 등 정적 사이트를 지원하는 서비스라면 이 폴더 자체를 프로젝트로 배포하면 됩니다.
빌드 명령은 필요 없고 출력 디렉터리도 별도로 지정할 필요가 없습니다.

## 오프닝

1. 첫 번째 이미지 + 자막 타이핑
2. 두 번째 이미지 + `그는 모르고 있었다..`
3. 세 번째 이미지 + 머리 안의 혈투 자막
4. 네 번째 이미지가 잠시 표시된 뒤 자동으로 게임 시작

SKIP, 다음 버튼, 화면 클릭, Space/Enter를 지원합니다.
