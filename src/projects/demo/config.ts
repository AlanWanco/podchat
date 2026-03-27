export const demoConfig = {
  projectId: "demo",
  projectTitle: "横版测试 Demo",
  fps: 60,
  dimensions: { width: 1920, height: 1080 },
  chatLayout: {
    paddingTop: 48,
    paddingBottom: 120, // 底部留白，控制新气泡出现的高度
    paddingX: 48
  },
  audioPath: "/projects/demo/assets/test_audio.aac",
  assPath: "/projects/demo/assets/ass_test.ass",
  background: {
    image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1920&q=80",
    blur: 8 // px
  },
  speakers: {
    "A": { 
      name: "主播A", 
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=A", 
      side: "left", 
      style: { 
        bgColor: "#2563eb", 
        textColor: "#ffffff", 
        borderRadius: 32,
        opacity: 0.9,
        blur: 4,
        borderWidth: 0,
        borderColor: "#ffffff",
        borderOpacity: 1.0,
        margin: 16,
        paddingX: 24,
        paddingY: 16,
        fontFamily: "system-ui",
        fontSize: 20,
        fontWeight: "normal",
        scale: 1.0
      }
    },
    "B": { 
      name: "嘉宾B", 
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=B", 
      side: "right", 
      style: { 
        bgColor: "#f3f4f6", 
        textColor: "#111827", 
        borderRadius: 32,
        opacity: 0.9,
        blur: 4,
        borderWidth: 0,
        borderColor: "#ffffff",
        borderOpacity: 1.0,
        margin: 16,
        paddingX: 24,
        paddingY: 16,
        fontFamily: "system-ui",
        fontSize: 20,
        fontWeight: "normal",
        scale: 1.0
      }
    }
  },
  content: []
};
