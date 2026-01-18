import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Platform, ActivityIndicator, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import { Feather } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { useQuery } from '@tanstack/react-query';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { useAuthContext } from '@/context/AuthContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  content: string;
  placeholders: string[];
  pageSize: string;
  orientation: string;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  fontFamily: string;
  fontSize: number;
  showPageNumbers: boolean;
  pageNumberPosition: string;
  pageNumberOffset: number;
  showHeader: boolean;
  showFooter: boolean;
  headerText?: string;
  footerText?: string;
  headerAlignment: string;
  footerAlignment: string;
  status: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  general: { bg: '#e0e7ff', text: '#4338ca' },
  inspection: { bg: '#dbeafe', text: '#1E40AF' },
  sample: { bg: '#dcfce7', text: '#059669' },
  notice: { bg: '#fef3c7', text: '#d97706' },
  prosecution: { bg: '#fee2e2', text: '#dc2626' },
  certificate: { bg: '#e0e7ff', text: '#6366f1' },
};

function TemplateCard({ 
  template, 
  onDownload, 
  isDownloading 
}: { 
  template: DocumentTemplate; 
  onDownload: () => void; 
  isDownloading: boolean;
}) {
  const { theme } = useTheme();
  const colors = categoryColors[template.category] || categoryColors.general;

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: colors.bg }]}>
          <ThemedText type="small" style={{ color: colors.text, fontWeight: '600' }}>
            {template.category.toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.formatInfo}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {template.pageSize} | {template.orientation}
          </ThemedText>
        </View>
      </View>
      
      <ThemedText type="h4" style={styles.templateName}>
        {template.name}
      </ThemedText>
      
      {template.description ? (
        <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
          {template.description}
        </ThemedText>
      ) : null}
      
      <View style={styles.cardFooter}>
        <View style={styles.formatTags}>
          <View style={[styles.tag, { backgroundColor: theme.backgroundRoot }]}>
            <Feather name="type" size={12} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {template.fontFamily}
            </ThemedText>
          </View>
          <View style={[styles.tag, { backgroundColor: theme.backgroundRoot }]}>
            <Feather name="maximize-2" size={12} color={theme.textSecondary} />
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {template.fontSize}pt
            </ThemedText>
          </View>
        </View>
        
        <Pressable
          style={({ pressed }) => [
            styles.downloadBtn,
            { backgroundColor: theme.primary },
            pressed && { opacity: 0.8 },
            isDownloading && { opacity: 0.6 },
          ]}
          onPress={onDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Feather name="download" size={16} color="#FFFFFF" />
              <ThemedText type="small" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Download
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>
    </Card>
  );
}

export default function TemplatesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { user } = useAuthContext();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery<DocumentTemplate[]>({
    queryKey: ['/api/templates'],
  });

  const replacePlaceholders = (content: string): string => {
    const now = new Date();
    const placeholderValues: Record<string, string> = {
      officer_name: user?.name || '',
      officer_designation: user?.designation || 'Food Safety Officer',
      officer_email: user?.email || '',
      jurisdiction_name: user?.jurisdiction?.unitName || '',
      jurisdiction_type: user?.jurisdiction?.roleName || '',
      current_date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
      current_time: now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      fbo_name: '[FBO Name]',
      fbo_address: '[FBO Address]',
      fbo_license: '[FBO License Number]',
      inspection_date: '[Inspection Date]',
      sample_code: '[Sample Code]',
      sample_name: '[Sample Name]',
    };

    let result = content;
    Object.entries(placeholderValues).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return result;
  };

  const generatePdfHtml = (template: DocumentTemplate): string => {
    const processedContent = replacePlaceholders(template.content);
    const contentWithLineBreaks = processedContent.replace(/\n/g, '<br>');
    
    const pageNumberPosition = template.pageNumberPosition || 'center';
    const pageNumberOffset = template.pageNumberOffset || 0;
    const headerAlignment = template.headerAlignment || 'center';
    const footerAlignment = template.footerAlignment || 'center';
    
    let pageNumberStyle = `text-align: ${pageNumberPosition};`;
    if (pageNumberPosition === 'left') {
      pageNumberStyle += ` padding-left: ${template.marginLeft + pageNumberOffset}mm;`;
    } else if (pageNumberPosition === 'right') {
      pageNumberStyle += ` padding-right: ${template.marginRight - pageNumberOffset}mm;`;
    } else {
      pageNumberStyle += ` margin-left: ${pageNumberOffset}mm;`;
    }

    const headerHtml = template.showHeader !== false && template.headerText 
      ? `<div class="header" style="text-align: ${headerAlignment};">${template.headerText}</div>` 
      : '';
    
    const footerHtml = template.showFooter !== false && template.footerText 
      ? `<div class="footer" style="text-align: ${footerAlignment};">${template.footerText}</div>` 
      : '';
    
    const pageNumberHtml = template.showPageNumbers !== false 
      ? `<div class="page-number" style="${pageNumberStyle}">Page 1</div>` 
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${template.name}</title>
          <style>
            @page {
              size: ${template.pageSize} ${template.orientation};
              margin: ${template.marginTop}mm ${template.marginRight}mm ${template.marginBottom}mm ${template.marginLeft}mm;
            }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: "${template.fontFamily}", serif;
              font-size: ${template.fontSize}pt;
              line-height: 1.6;
              color: #1f2937;
            }
            .header {
              padding-bottom: 16px;
              border-bottom: 1px solid #e5e7eb;
              margin-bottom: 24px;
              font-weight: 600;
            }
            .footer {
              padding-top: 16px;
              border-top: 1px solid #e5e7eb;
              margin-top: 24px;
              font-size: 10pt;
              color: #6b7280;
            }
            .page-number {
              margin-top: 20px;
              font-size: 10pt;
              color: #6b7280;
            }
            .content {
              white-space: pre-wrap;
            }
            table { border-collapse: collapse; width: 100%; margin: 12px 0; }
            th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
            th { background: #f3f4f6; font-weight: 600; }
            h1, h2, h3, h4, h5, h6 { margin: 16px 0 8px 0; }
            p { margin: 8px 0; }
            ul, ol { margin: 8px 0; padding-left: 24px; }
            .signature-line { border-bottom: 1px solid #000; width: 200px; display: inline-block; margin-top: 40px; }
          </style>
        </head>
        <body>
          ${headerHtml}
          <div class="content">${contentWithLineBreaks}</div>
          ${footerHtml}
          ${pageNumberHtml}
        </body>
      </html>
    `;
  };

  const handleDownload = async (template: DocumentTemplate) => {
    try {
      setDownloadingId(template.id);

      const html = generatePdfHtml(template);
      
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
        setDownloadingId(null);
        return;
      }

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${template.name}`,
        });
      } else {
        Alert.alert('Success', 'PDF generated successfully');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const renderTemplate = ({ item }: { item: DocumentTemplate }) => (
    <TemplateCard
      template={item}
      onDownload={() => handleDownload(item)}
      isDownloading={downloadingId === item.id}
    />
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight + Spacing.xl }]}>
        <View style={styles.loadingContainer}>
          <SkeletonLoader height={180} />
          <SkeletonLoader height={180} />
          <SkeletonLoader height={180} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="file-text" size={64} color={theme.textSecondary} style={{ opacity: 0.4 }} />
            <ThemedText type="h3" style={[styles.emptyTitle, { color: theme.text }]}>
              No Templates Available
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: 'center' }}>
              Document templates will appear here once they are configured by the administrator.
            </ThemedText>
          </View>
        }
        ListHeaderComponent={
          templates.length > 0 ? (
            <View style={styles.header}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                Download document templates with your jurisdiction data pre-filled
              </ThemedText>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  formatInfo: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  templateName: {
    marginTop: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  formatTags: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.md,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});
