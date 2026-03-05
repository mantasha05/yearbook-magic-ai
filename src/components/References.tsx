import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const references = [
  {
    name: "Ananya Sharma",
    role: "Final Year Student, IIT Delhi",
    text: "Memorie made our batch yearbook effortless. We uploaded 500+ photos and had a stunning book ready in days!",
    rating: 5,
  },
  {
    name: "Rohan Mehta",
    role: "College Committee Head, BITS Pilani",
    text: "The AI-powered layout engine saved us weeks of manual design work. Absolutely blown away by the quality.",
    rating: 5,
  },
  {
    name: "Priya Desai",
    role: "Class Representative, NIT Trichy",
    text: "Our seniors loved the personalized sections — quotes, memories, and photos all beautifully organized.",
    rating: 5,
  },
  {
    name: "Arjun Patel",
    role: "Student Council, VJTI Mumbai",
    text: "We tried 3 other tools before Memorie. Nothing comes close to the templates and ease of use here.",
    rating: 5,
  },
  {
    name: "Sneha Kulkarni",
    role: "Farewell Coordinator, Pune University",
    text: "From uploading photos to generating the final PDF — everything was smooth. Our batch of 200 loved it!",
    rating: 4,
  },
  {
    name: "Vikram Singh",
    role: "Alumni Association, DTU",
    text: "We used Memorie for our alumni reunion yearbook. The QR code feature linking to video messages was a hit.",
    rating: 5,
  },
  {
    name: "Kavya Nair",
    role: "Design Club Lead, IIIT Hyderabad",
    text: "As a designer, I'm picky about aesthetics. Memorie's templates are genuinely beautiful and customizable.",
    rating: 5,
  },
  {
    name: "Aditya Joshi",
    role: "Batch President, VIT Vellore",
    text: "Coordinating 300 students' content was a nightmare until we used Memorie. The collaboration features are top-notch.",
    rating: 4,
  },
  {
    name: "Meera Iyer",
    role: "Teacher, DPS Bangalore",
    text: "I helped my students create their school yearbook. Even 10th graders could use it without any guidance!",
    rating: 5,
  },
  {
    name: "Farhan Sheikh",
    role: "Photography Club, AMU",
    text: "The image optimization and smart cropping are incredible. Our photos looked professional without any editing.",
    rating: 5,
  },
];

const References = () => {
  return (
    <section className="py-20 bg-muted/30" id="references">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-display font-semibold tracking-wide uppercase mb-4">
            Trusted by Students
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            What Our Users Say
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of students and institutions who've created unforgettable yearbooks with Memorie.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {references.map((ref, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-lg transition-shadow relative group"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s < ref.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                "{ref.text}"
              </p>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-display font-bold text-sm">
                  {ref.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-foreground">
                    {ref.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{ref.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default References;
