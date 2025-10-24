import { Settings } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PremiumSettings } from './PremiumSettings';
import { NotificationSettings } from './NotificationSettings';
import { ScrollArea } from './ui/scroll-area';

export const SettingsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your app preferences and subscription
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="premium" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <ScrollArea className="h-[500px] pr-4">
            <TabsContent value="premium" className="mt-4">
              <PremiumSettings />
            </TabsContent>
            <TabsContent value="notifications" className="mt-4 space-y-4">
              <div className="rounded-lg border p-4">
                <NotificationSettings />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
