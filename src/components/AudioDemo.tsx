import { useState, useEffect } from "react";
import { Skeleton } from "./ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./ui/use-toast";
import { Volume2 } from "lucide-react";

const AudioDemo = () => {
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getAudioUrl = async () => {
      try {
        // First, list files in the audio bucket to get the actual filename
        const { data: files, error: listError } = await supabase
          .storage
          .from('audio')
          .list();

        if (listError) {
          console.error('Error listing files:', listError);
          throw listError;
        }

        if (!files || files.length === 0) {
          throw new Error('No audio files found in the bucket');
        }

        // Get the first audio file from the bucket
        const audioFile = files[0];
        console.log('Found audio file:', audioFile.name);

        // Create a signed URL for the file
        const { data: urlData, error: urlError } = await supabase
          .storage
          .from('audio')
          .createSignedUrl(audioFile.name, 3600);

        if (urlError) {
          console.error('Error creating signed URL:', urlError);
          throw urlError;
        }

        if (!urlData?.signedUrl) {
          throw new Error('No signed URL generated');
        }

        console.log('Generated signed URL:', urlData.signedUrl);
        setAudioUrl(urlData.signedUrl);
      } catch (error) {
        console.error('Error loading audio:', error);
        toast({
          variant: "destructive",
          title: "Error loading audio",
          description: "Please try refreshing the page.",
        });
      } finally {
        setLoading(false);
      }
    };

    getAudioUrl();
  }, [toast]);

  return (
    <section className="py-20 bg-purple-50/50 relative overflow-hidden" id="demo">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />
        <div className="absolute -left-48 bottom-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
            <Volume2 className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-purple-800 mb-4">
            Hear the Glow
          </h2>
          <p className="text-purple-700 mb-8">
            Listen to how our AI receptionist handles real-world scenarios with natural,
            professional conversations.
          </p>
          
          <div className="bg-white p-8 rounded-2xl shadow-xl backdrop-blur-lg border-2 border-purple-100">
            {loading ? (
              <Skeleton className="w-full h-12" />
            ) : audioUrl ? (
              <audio
                controls
                className="w-full"
                preload="auto"
                src={audioUrl}
                onError={(e) => {
                  console.error('Audio playback error:', e);
                  toast({
                    variant: "destructive",
                    title: "Audio playback error",
                    description: "There was an error playing the audio file.",
                  });
                }}
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="text-red-500">Audio file not found</p>
            )}
            <p className="mt-6 text-sm text-purple-600">
              Experience how Glowline handles appointment scheduling, inquiries, and more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AudioDemo;