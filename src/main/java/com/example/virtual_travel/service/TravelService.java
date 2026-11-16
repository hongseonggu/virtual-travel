package com.example.virtual_travel.service;

import com.example.virtual_travel.dto.TravelRequestDto;
import com.example.virtual_travel.dto.TravelResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Service
public class TravelService {

    private final WebClient grokWebClient;
    private final WebClient unsplashWebClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final String UNSPLASH_ACCESS_KEY = "S297AcUXHzFnmDrNCyF3fFJkKI6a4G4vz9hs5mF79mw";

    public TravelService(WebClient grokWebClient) {
        this.grokWebClient = grokWebClient;
        this.unsplashWebClient = WebClient.builder()
                .baseUrl("https://api.unsplash.com")
                .build();
    }

    public TravelResponseDto generateTravel(TravelRequestDto requestDto) {
        String systemPrompt = "당신은 몰입감 넘치는 인터랙티브 가상 여행 RPG 가이드입니다.\n" +
                "유저가 제공한 [이전 스토리 맥락]과 [이번 선택/요청]을 이어받아, 자연스럽게 다음 여행 스토리를 300자 이내로 작성하세요.\n" +
                "그리고 이 장면에 어울리는 Unsplash 이미지 검색용 영문 키워드 2~3개를 콤마로 구분하여 도출하고, 유저가 다음에 고를 수 있는 선택지 3개를 리스트로 함께 만들어 주세요.\n" +
                "반드시 다른 사족 없이 아래 JSON 형식으로만 답변하세요:\n" +
                "{\n" +
                "  \"story\": \"이어지는 스토리 내용\",\n" +
                "  \"keyword\": \"영문 키워드\",\n" +
                "  \"choices\": [\"선택지1\", \"선택지2\", \"선택지3\"]\n" +
                "}";

        String userMessage;
        if (requestDto.getPreviousStory() == null || requestDto.getPreviousStory().isEmpty()) {
            userMessage = "여행 시작 프롬프트: " + requestDto.getPrompt();
        } else {
            userMessage = "[이전 스토리 맥락]: " + requestDto.getPreviousStory() + "\n[유저의 선택/행동]: " + requestDto.getPrompt();
        }

        Map<String, Object> requestBody = Map.of(
                "model", "grok-4.7",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "temperature", 0.7
        );

        try {
            Map<String, Object> apiResponse = grokWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String contentJson = extractTextFromResponse(apiResponse);
            String storyText;
            String imageKeyword;
            List<String> choices;

            try {
                String cleanedJson = contentJson.replaceAll("```json", "").replaceAll("```", "").trim();
                Map<String, Object> parsedContent = objectMapper.readValue(cleanedJson, Map.class);
                storyText = (String) parsedContent.getOrDefault("story", contentJson);
                imageKeyword = (String) parsedContent.getOrDefault("keyword", "japan,travel");
                choices = (List<String>) parsedContent.getOrDefault("choices", List.of("주변 둘러보기", "다음 장소로 이동하기", "휴식 취하기"));
            } catch (Exception e) {
                storyText = contentJson;
                imageKeyword = "japan,travel";
                choices = List.of("주변 둘러보기", "다음 장소로 이동하기", "휴식 취하기");
            }

            String imageUrl = fetchImageUrlFromUnsplash(imageKeyword);

            return new TravelResponseDto(storyText, imageUrl, choices);

        } catch (Exception e) {
            e.printStackTrace();
            return new TravelResponseDto("AI 통신 오류가 발생했습니다: " + e.getMessage(), "", List.of());
        }
    }

    private String fetchImageUrlFromUnsplash(String keyword) {
        try {
            Map<?, ?> response = unsplashWebClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/photos/random")
                            .queryParam("query", keyword)
                            .queryParam("client_id", UNSPLASH_ACCESS_KEY)
                            .queryParam("orientation", "landscape")
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response != null && response.containsKey("urls")) {
                Map<?, ?> urls = (Map<?, ?>) response.get("urls");
                return (String) urls.get("regular");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80";
    }

    private String extractTextFromResponse(Map<String, Object> response) {
        try {
            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> choiceMap = (Map<?, ?>) choices.get(0);
            Map<?, ?> messageMap = (Map<?, ?>) choiceMap.get("message");
            return messageMap.get("content").toString();
        } catch (Exception e) {
            return "응답 파싱 실패";
        }
    }
}